const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Race', {
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
};