"use strict";

module.exports = (sequelize, DataTypes) => {
    const CourseTaskAssessmentDetail = sequelize.define('CourseTaskAssessmentDetail', {
      question: DataTypes.TEXT,
      options: {
        type: DataTypes.JSON, // or DataTypes.JSONB for PostgreSQL
        allowNull: true,
      },
      answer: DataTypes.TEXT,
      type: DataTypes.STRING,
    });
  
    CourseTaskAssessmentDetail.associate = (models) => {
      CourseTaskAssessmentDetail.belongsTo(models.CourseTaskAssessment);
    };
  
    return CourseTaskAssessmentDetail;
  };