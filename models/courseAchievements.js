"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseAchievements",
		{
			result: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseEnrollmentUsers);
	};
	return table;
};
