"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseModules",
		{
			title: DataTypes.STRING,
			description: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseSyllabus);
		table.hasMany(models.courseTasks);
	};
	return table;
};
