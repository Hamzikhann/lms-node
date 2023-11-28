"use strict";

module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define(
		"transcript",
		{
			content: DataTypes.TEXT,
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	table.associate = function (models) {
		table.belongsTo(models.courseTasks);
	};
	return table;
};
