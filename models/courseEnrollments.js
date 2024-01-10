"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseEnrollments",
		{
			required: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			},
			courseProgress: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			completionDateOne: DataTypes.DATEONLY,
			completionDateTwo: DataTypes.DATEONLY,
			passingThreshold: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseEnrollmentTypes);
		table.belongsTo(models.courseAssignments);
		table.belongsTo(models.userDepartments);
		table.belongsTo(models.teams);
		table.hasMany(models.courseAchievements);
	};
	return table;
};
