"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define("courseTaskAssessmentQuestions", {
		title: DataTypes.TEXT,
		options: DataTypes.TEXT,
		answer: DataTypes.STRING,
		type: DataTypes.STRING,
		isActive: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "Y"
		}
	});
	table.associate = (models) => {
		table.belongsTo(models.courseTaskAssessments);
	};
	return table;
};
