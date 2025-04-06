const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Athlete', {
    name: DataTypes.STRING,
    reaction_time: DataTypes.FLOAT,
    acceleration: DataTypes.FLOAT,
    max_speed: DataTypes.FLOAT,
    decay: DataTypes.FLOAT
  });
};