"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseAchievements",
		{
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseEnrollments);
	};
	return table;
};