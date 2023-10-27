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
		table.belongsTo(models.users);
	};
	return table;
};
