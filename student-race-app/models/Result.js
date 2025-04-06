const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Result', {
    position: DataTypes.INTEGER
  });
};