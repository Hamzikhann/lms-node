"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseTasks",
		{
			title: DataTypes.STRING,
			description: DataTypes.STRING,
			estimatedTime: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseModules);
		table.belongsTo(models.courseTaskTypes);
		table.hasOne(models.courseTaskContent);
	};
	return table;
};
