"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define("courseTaskAssessment", {
		title: DataTypes.STRING,
		description: DataTypes.TEXT,
		estimatedTime: DataTypes.STRING,
		startTime: DataTypes.STRING,
		isActive: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "Y"
		}
	});
	table.associate = (models) => {
		table.belongsTo(models.courseTasks);
		table.hasMany(models.courseTaskAssessmentDetail);
	};
	return table;
};
