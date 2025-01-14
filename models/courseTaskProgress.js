"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseTaskProgress",
		{
			currentTime: DataTypes.STRING,
			percentage: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseTasks);
		table.belongsTo(models.users);
		table.belongsTo(models.clients);
		table.belongsTo(models.courseEnrollments);
		table.belongsTo(models.courses);
	};
	return table;
};
