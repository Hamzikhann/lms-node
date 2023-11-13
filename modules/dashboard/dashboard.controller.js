const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const Users = db.users;
const Roles = db.roles;
const Clients = db.clients;
const Courses = db.courses;
const CourseTasks = db.courseTasks;
exports.findAllforAdministrator = async (req, res) => {
	try {
		const clients = await Clients.findAll({
			include: [
				{
					model: Users,
					where: { isActive: "Y" },
					required: false,
					attributes: { exclude: ["isActive", "createdAt", "updatedAt"] },
					include: [
						{
							model: Courses,
							where: { isActive: "Y" },
							required: false,
							attributes: { exclude: ["isActive", "createdAt", "updatedAt"] },
							include: [
								{
									model: CourseTasks,
									where: { isActive: "Y" },
									required: false,
									attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
								}
							]
						}
					]
				}
			]
		});
		const dashboardData = clients.map((client) => {
			const users = client.users.map((user) => {
				const courses = user.courses.map((course) => {
					const totalTasks = course.courseTasks.length;
					const draftTasks = course.courseTasks.filter((task) => task.status === "D").length;
					const publishedTasks = course.courseTasks.filter((task) => task.status === "P").length;

					return {
						...course.toJSON(),
						totalTasks,
						draftTasks,
						publishedTasks
					};
				});

				return {
					...user.toJSON(),
					courses
				};
			});

			return {
				...client.toJSON(),
				users,
				userCount: users.length
			};
		});

		res.json(dashboardData);
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.userDashboard = async (req, res) => {
	try {
		const userId = crypto.decrypt(req.userId);
		const clientId = crypto.decrypt(req.clientId);
		console.log(clientId);

		const totalEnrolledCourses = await CourseEnrollments.count({
			where: {
				userId: userId,
				isActive: "Y"
			},
			include: [
				{
					model: CourseAssignments,
					isActive: "Y",
					include: [
						{
							model: Course,
							isActive: "Y",
							status: "P"
						}
					]
				}
			]
		});

		const inProgressCourses = await CourseEnrollments.count({
			where: { courseProgress: { [Op.lt]: 100, [Op.gt]: 0 }, userId },
			include: [
				{
					model: CourseAssignments,
					isActive: "Y",
					include: [
						{
							model: Course,
							isActive: "Y",
							status: "P"
						}
					]
				}
			]
		});

		const completedCourses = await CourseEnrollments.count({
			where: { courseProgress: { [Op.eq]: 100 }, userId },
			include: [
				{
					model: CourseAssignments,
					isActive: "Y",
					include: [
						{
							model: Course,
							isActive: "Y",
							status: "P"
						}
					]
				}
			]
		});

		const inQueue = await CourseEnrollments.count({
			where: { courseProgress: { [Op.eq]: 0 }, userId },
			include: [
				{
					model: CourseAssignments,
					isActive: "Y",
					include: [
						{
							model: Course,
							isActive: "Y",
							status: "P"
						}
					]
				}
			]
		});
		let dashboardData = {
			totalEnrolledCourses: totalEnrolledCourses,
			inProgressCourses: inProgressCourses,
			completedCourses: completedCourses,
			inQueue: inQueue
		};
		res.send({ data: dashboardData });
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
