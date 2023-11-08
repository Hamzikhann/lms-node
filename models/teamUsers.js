"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"teamUsers",
		{
			name: DataTypes.STRING,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.teams);
		table.belongsTo(models.users);
		table.belongsTo(models.clients);
	};
	return table;
};
