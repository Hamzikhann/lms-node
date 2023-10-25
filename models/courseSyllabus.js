"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseSyllabus",
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
		table.belongsTo(models.courses);
		table.hasMany(models.courseModules);
	};
	return table;
};
