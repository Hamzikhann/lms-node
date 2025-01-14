"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"userDepartments",
		{
			title: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.hasMany(models.users);
		table.hasMany(models.courseEnrollments);
	};
	return table;
};
