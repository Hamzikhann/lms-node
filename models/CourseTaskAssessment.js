"use strict";

module.exports = (sequelize, DataTypes) => {
    const CourseTaskAssessment = sequelize.define('CourseTaskAssessment', {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      estimatedTime: DataTypes.INTEGER,
      startTime: DataTypes.DATE,
    });
  
    CourseTaskAssessment.associate = (models) => {
      CourseTaskAssessment.belongsTo(models.courseTasks);
      CourseTaskAssessment.hasMany(models.CourseTaskAssessmentDetail);
    };
  
    return CourseTaskAssessment;
  };