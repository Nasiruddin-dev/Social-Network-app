import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Prefer a single DATABASE_URL (Railway) and fallback to discrete env vars
const URL_CANDIDATES = [
  process.env.DATABASE_URL,
  process.env.RAILWAY_DATABASE_URL,
  process.env.MYSQL_URL,
  process.env.CLEARDB_DATABASE_URL,
  process.env.JAWSDB_URL,
].filter(Boolean);

const sslEnabled = String(process.env.DB_SSL || "false").toLowerCase() === "true";

function buildConfigFromUrl(urlString) {
  try {
    const u = new URL(urlString);
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  } catch (_e) {
    return null;
  }
}

let connectionConfig = null;
let via = "env";
for (const candidate of URL_CANDIDATES) {
  const cfg = buildConfigFromUrl(candidate);
  if (cfg) { connectionConfig = cfg; via = "url"; break; }
}

if (!connectionConfig) {
  connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

if (process.env.NODE_ENV !== 'test') {
  const { host, port, database } = connectionConfig;
  console.log(`[db] Using ${via === 'url' ? 'DATABASE_URL' : 'env vars'} -> ${host}:${port} db=${database} ssl=${sslEnabled}`);
}

// Use a pool to avoid immediate fatal connect and to improve resilience
export const db = mysql.createPool({
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  ...connectionConfig,
});

// Non-fatal connectivity probe (logs only)
try {
  db.getConnection((err, conn) => {
    if (err) {
      console.warn(`[db] Initial connection check failed: ${err.code || err.message}`);
    } else {
      conn.release();
    }
  });
} catch (_e) {
  // ignore
}