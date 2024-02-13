"use strict";

module.exports = (sequelize, DataTypes) => {
	const courses = sequelize.define(
		"courses",
		{
			title: DataTypes.STRING,
			about: DataTypes.TEXT,
			code: DataTypes.STRING,
			level: DataTypes.STRING,
			language: DataTypes.STRING,
			approximateTime: DataTypes.STRING,
			passingThreshold: DataTypes.STRING,

			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "D"
			},
			isActive: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Y"
			}
		},
		{ timestamps: true }
	);
	courses.associate = function (models) {
		courses.belongsTo(models.courseDepartments);
		courses.belongsTo(models.classes);
		courses.hasMany(models.courseAssignments);
		courses.hasMany(models.courseBooks);
		courses.hasMany(models.courseFaqs);
		courses.hasMany(models.courseInstructors);
		courses.hasMany(models.courseObjectives);
		courses.hasMany(models.courseUsefulLinks);
		courses.hasMany(models.courseTaskProgress);
		courses.hasOne(models.courseSyllabus);
	};
	return courses;
};
