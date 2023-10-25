'use strict';

module.exports = (sequelize, DataTypes) => {
  const table = sequelize.define('courseEnrollments', {
    progress:DataTypes.STRING,
    required: {
      type: DataTypes.STRING,  
      allowNull: false, 
      defaultValue: 'Y'
    },
    isActive: {
      type: DataTypes.STRING,  
      allowNull: false, 
      defaultValue: 'Y'
    },
  }, { timestamps: true });
  table.associate = function (models) {
    table.hasMany(models.courses)
    table.hasMany(models.users)
  };
  return table;
};