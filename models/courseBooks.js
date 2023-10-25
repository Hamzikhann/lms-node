'use strict';

module.exports = (sequelize, DataTypes) => {
  const table = sequelize.define('courseBooks', {
    title: DataTypes.STRING,
    edition:DataTypes.STRING,
    author:DataTypes.STRING,
    publisher:DataTypes.STRING,
    bookUrl:DataTypes.STRING,
    isActive: {
      type: DataTypes.STRING,  
      allowNull: false, 
      defaultValue: 'Y'
    },
  }, { timestamps: true });
  table.associate = function (models) {
    table.belongsTo(models.courses)
  };
  return table;
};