"use strict";

module.exports = (sequelize, DataTypes) => {
    const table = sequelize.define('courseTaskAssessmentDetail', {
      question: DataTypes.TEXT,
      options: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      answer: DataTypes.TEXT,
      type: DataTypes.STRING,
      isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
    });
    table.associate = (models) => {
      table.belongsTo(models.courseTaskAssessment);
    };
  
    return table;
  };