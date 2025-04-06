const { Sequelize } = require('sequelize');

// Используем переменные окружения или значения по умолчанию
const sequelize = new Sequelize(
  process.env.DB_NAME || 'race_stats',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || '1111',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false
  }
);

module.exports = sequelize;