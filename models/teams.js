"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"teams",
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
		table.belongsTo(models.clients);
		table.hasMany(models.teamUsers);
	};
	return table;
};
