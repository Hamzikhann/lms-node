const db = require("../models");
const encryptHelper = require("./encryptHelper");
const emails = require("./emails");
const crypto = require("./crypto");
const Joi = require("@hapi/joi");
const { Op } = require("sequelize");

const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;
const CourseTaskContent = db.courseTaskContent;
const CourseTaskTypes = db.courseTaskTypes;
const CourseTaskProgress = db.courseTaskProgress;
const Course = db.courses;
const CourseEnrollment = db.courseEnrollments;
const CourseAssignment = db.courseAssignments;
const CourseAchivements = db.courseAchievements;
const User = db.users;
const Client = db.clients;

const checkCourseCompletion = async (req, res) => {
	try {
		const date = new Date();
		const dateString = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
		const achivedIds = [];
		console.log(dateString);
		const courseAchievements = await CourseAchivements.findAll({
			where: { isActive: "Y" },
			attributes: ["id", "courseEnrollmentId"]
		});

		courseAchievements.forEach((e) => {
			achivedIds.push(e.courseEnrollmentId);
		});
		console.log(achivedIds);

		const dateOne = await CourseEnrollment.findAll({
			where: {
				isActive: "Y",
				id: {
					[Op.not]: achivedIds
				},
				[Op.and]: [
					{ completionDateOne: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
					{ completionDateTwo: { [Op.gte]: dateString } }
				]
			},
			include: [
				{
					model: CourseAssignment,
					where: {
						isActive: "Y",
						[Op.and]: [
							{ dateFrom: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
							{ dateTo: { [Op.gte]: dateString } }
						]
					},

					include: [
						{
							model: Course,
							where: {
								isActive: "Y"
							}
						}
					]
				},
				{
					model: CourseEnrollmentUsers,
					where: {
						isActive: "Y"
					},
					include: [
						{
							model: User,
							where: { isActive: "Y" },
							include: [
								{
									model: User,
									as: "manager",
									attributes: ["id", "firstName", "lastName"]
								}
							],
							attributes: ["id", "email", "clientId", "managerId"]
						}
					]
				}
			],
			attributes: ["id", "courseAssignmentId", "completionDateOne", "completionDateTwo"]
		});

		const dateTwo = await CourseEnrollment.findAll({
			where: { isActive: "Y", id: { [Op.not]: achivedIds }, completionDateTwo: { [Op.lt]: dateString } },
			include: [
				{
					model: CourseAssignment,
					where: {
						isActive: "Y",
						[Op.and]: [
							{ dateFrom: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
							{ dateTo: { [Op.gte]: dateString } }
						]
					},
					include: [
						{
							model: Course,
							where: {
								isActive: "Y"
							},
							attributes: ["id", "title"]
						}
					]
				},
				{
					model: CourseEnrollmentUsers,
					where: {
						isActive: "Y"
					},
					include: [
						{
							model: User,
							where: { isActive: "Y" },
							include: [
								{
									model: User,
									as: "manager",
									include: [
										{
											model: User,
											as: "manager",
											attributes: ["id", "firstName", "lastName", "email"]
										}
									],
									attributes: ["id", "firstName", "lastName", "email"]
								}
							],
							attributes: ["id", "email", "clientId", "managerId"]
						}
					]
				}
			],
			attributes: ["id", "courseAssignmentId", "completionDateOne", "completionDateTwo"]
		});

		// res.send({ dateOne: dateOne, dateTwo: dateTwo });
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

module.exports = { checkCourseCompletion };
