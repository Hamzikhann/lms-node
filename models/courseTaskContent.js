'use strict';


module.exports = (sequelize, DataTypes) => {
  const table = sequelize.define('courseTaskContent', {
    description: DataTypes.STRING,
    videoLink: DataTypes.STRING,
    handoutLink: DataTypes.STRING,
    isActive: {
      type: DataTypes.STRING,  
      allowNull: false, 
      defaultValue: 'Y'
    },
  }, { timestamps: true });
  table.associate = function (models) {
    table.belongsTo(models.courseTasks)
  };
  return table;
};