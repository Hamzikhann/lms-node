"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define("courseTaskAssessments", {
		title: DataTypes.STRING,
		description: DataTypes.TEXT,
		estimatedTime: DataTypes.STRING,
		startTime: DataTypes.STRING,
		questionType: DataTypes.STRING,
		isActive: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "Y"
		}
	});
	table.associate = (models) => {
		table.belongsTo(models.courseTasks);
		table.hasMany(models.courseTaskAssessmentQuestions);
	};
	return table;
};
