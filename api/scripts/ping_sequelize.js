import sequelize from '../models/index.js';

(async () => {
  try {
    await sequelize.authenticate();
    const conf = sequelize.config;
    console.log(`[sequelize] Connected to ${conf.host}:${conf.port} db=${conf.database}`);
    process.exit(0);
  } catch (e) {
    console.error('[sequelize] Connection failed:', e.message);
    process.exit(1);
  }
})();
