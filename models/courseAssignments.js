"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseAssignments",
		{
			dateFrom: DataTypes.DATEONLY,
			dateTo: DataTypes.DATEONLY,
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
		table.belongsTo(models.clients);
		table.hasMany(models.courseEnrollments);
	};
	return table;
};
