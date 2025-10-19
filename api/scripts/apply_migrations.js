import fs from 'fs';
import path from 'path';
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function execStatement(sql) {
  return new Promise((resolve) => {
    if (!sql || !sql.trim()) return resolve();
    connection.query(sql, (err) => {
      if (err) {
        // Ignore common idempotent migration errors
        const ignorable = new Set([
          'ER_DUP_FIELDNAME',
          'ER_TABLE_EXISTS_ERROR',
          'ER_DUP_KEYNAME',
          'ER_CANT_DROP_FIELD_OR_KEY',
        ]);
        if (ignorable.has(err.code)) {
          console.log(`[skip] ${err.code}: ${err.sqlMessage}`);
          return resolve();
        }
        console.error(`Error running statement: ${err.sqlMessage}`);
        return resolve(); // continue running others
      }
      resolve();
    });
  });
}

async function run() {
  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations folder not found:', migrationsDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.warn('No migration files found.');
    process.exit(0);
  }

  console.log('Applying migrations in order:\n- ' + files.join('\n- '));

  connection.connect(async (err) => {
    if (err) {
      console.error('DB connection failed:', err.message);
      process.exit(1);
    }

    for (const file of files) {
      const full = path.join(migrationsDir, file);
      console.log(`\n>> Running ${file}`);
      const sql = fs.readFileSync(full, 'utf8');
      // naive split by ; (won't handle procedures). Our files are simple DDL.
      const statements = sql
        .split(/;\s*\n/g)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        await execStatement(stmt);
      }
      console.log(`<< Done ${file}`);
    }

    connection.end();
    console.log('\nAll migrations applied.');
  });
}

run().catch((e) => {
  console.error(e);
  try { connection.end(); } catch {}
  process.exit(1);
});
