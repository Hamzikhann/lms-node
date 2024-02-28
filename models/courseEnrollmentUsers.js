"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseEnrollmentUsers",
		{
			progress: {
				type: DataTypes.STRING,
				defaultValue: "0"
			},
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.users);
		table.belongsTo(models.courseEnrollments);
		table.hasMany(models.courseAchievements);
	};
	return table;
};
