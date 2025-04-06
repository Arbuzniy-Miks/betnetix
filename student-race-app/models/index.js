const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Athlete = require('./Athlete')(sequelize);
const Race = require('./Race')(sequelize);
const Result = require('./Result')(sequelize);

// Ассоциации
Race.hasMany(Result, { foreignKey: 'race_id' });
Athlete.hasMany(Result, { foreignKey: 'athlete_id' });

Result.belongsTo(Race, { foreignKey: 'race_id' });
Result.belongsTo(Athlete, { foreignKey: 'athlete_id' });

module.exports = {
  sequelize,
  Sequelize,
  Athlete,
  Race,
  Result
};