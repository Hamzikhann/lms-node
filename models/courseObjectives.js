"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseObjectives",
		{
			description: DataTypes.TEXT,
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
	};
	return table;
};
