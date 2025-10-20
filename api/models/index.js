import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const URL_CANDIDATES = [
  process.env.DATABASE_URL,
  process.env.RAILWAY_DATABASE_URL,
  process.env.MYSQL_URL,
  process.env.CLEARDB_DATABASE_URL,
  process.env.JAWSDB_URL,
].filter(Boolean);

const sslEnabled = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';

function buildOptionsFromUrl(urlString) {
  try {
    const u = new URL(urlString);
    return {
      dialect: 'mysql',
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 3306,
      database: u.pathname.replace(/^\//, ''),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      dialectOptions: sslEnabled ? { ssl: { rejectUnauthorized: false } } : {},
      logging: false,
    };
  } catch (e) {
    return null;
  }
}

let sequelize;
for (const candidate of URL_CANDIDATES) {
  const opts = buildOptionsFromUrl(candidate);
  if (opts) {
    sequelize = new Sequelize(opts);
    break;
  }
}

if (!sequelize) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      dialect: 'mysql',
      dialectOptions: sslEnabled ? { ssl: { rejectUnauthorized: false } } : {},
      logging: false,
    }
  );
}

export default sequelize;
