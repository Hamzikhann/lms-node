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
			completionDateOne: DataTypes.DATEONLY,
			completionDateTwo: DataTypes.DATEONLY,
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
		table.hasMany(models.courseEnrollmentUsers);
	};
	return table;
};
