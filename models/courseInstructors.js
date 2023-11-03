"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"courseInstructors",
		{
			name: DataTypes.STRING,
			about: DataTypes.TEXT,
			imageUrl: DataTypes.STRING,
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
	};
	return table;
};
