"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseEnrollments",
		{
			progress: DataTypes.STRING,
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
		table.belongsTo(models.courses);
		table.belongsTo(models.users);
		table.belongsTo(models.clients);
	};
	return table;
};
