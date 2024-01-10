"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"users",
		{
			firstName: DataTypes.STRING,
			lastName: DataTypes.STRING,
			email: DataTypes.STRING,
			password: DataTypes.STRING,
			imageURL: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.roles);
		table.belongsTo(models.clients);
		table.belongsTo(models.userDepartments);
		table.belongsTo(models.userDesignations);
		table.belongsTo(models.users, { foreignKey: "managerId", as: "manager" });
		table.hasMany(models.users, { foreignKey: "managerId", as: "employees" });
		table.hasOne(models.userProfile);
		table.hasMany(models.courseEnrollmentUsers);
	};
	return table;
};
