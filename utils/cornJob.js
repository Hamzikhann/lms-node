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

		const courseAchievements = await CourseAchivements.findAll({
			where: { isActive: "Y" },
			attributes: ["id", "courseEnrollmentId"]
		});

		courseAchievements.forEach((e) => {
			achivedIds.push(e.courseEnrollmentId);
		});

		const dateOne = await CourseEnrollment.findAll({
			where: { isActive: "Y", id: { [Op.not]: achivedIds } },
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
								isActive: "Y",

								[Op.and]: [
									{ completionDateOne: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
									{ completionDateTwo: { [Op.gte]: dateString } }
								]
							}
						}
					]
				},
				{
					model: User,
					where: { isActive: "Y" },
					attributes: ["id", "email", "clientId", "managerId"]
				}
			],
			attributes: ["id", "userId", "courseAssignmentId"]
		});

		const dateTwo = await CourseEnrollment.findAll({
			where: { isActive: "Y", id: { [Op.not]: achivedIds } },
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
								isActive: "Y",
								completionDateTwo: { [Op.lt]: dateString }
							}
						}
					]
				},
				{
					model: User,
					where: { isActive: "Y" },
					attributes: ["id", "email", "clientId", "managerId"]
				}
			],
			attributes: ["id", "userId", "courseAssignmentId"]
		});

		const managerIdsOne = dateOne.map((enrollment) => enrollment.user.managerId || []);
		const managerIdsTwo = dateTwo.map((enrollment) => enrollment.user.managerId || []);

		const managersOne = await User.findAll({
			where: { id: managerIdsOne }
		});

		const managers = await User.findAll({
			where: { id: managerIdsTwo }
		});
		const managerIds = managers.map((user) => user.managerId || []);
		const managersTwo = await User.findAll({
			where: { id: managerIds }
		});
		console.log("running");
		// const managerEmailsOne = managersOne.map((manager) => {manager.email});

		// console.log(managerEmails);

		// res.send({ dataOne: managersOne, dateTwo: managersTwo });
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

module.exports = { checkCourseCompletion };
