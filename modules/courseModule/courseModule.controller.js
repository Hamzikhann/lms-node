const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
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
const CourseEnrollmentUsers = db.courseEnrollmentUsers;

exports.list = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseSyllabusId: Joi.string().required(),
			courseEnrollmentId: Joi.string().optional()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseSyllabusId = crypto.decrypt(req.body.courseSyllabusId);
			const courseEnrollmentId = req.body.courseEnrollmentId ? crypto.decrypt(req.body.courseEnrollmentId) : null;
			var whereCourseTaskProgress = { userId: crypto.decrypt(req.userId), isActive: "Y" };
			if (req.role == "User") {
				whereCourseTaskProgress.courseEnrollmentId = courseEnrollmentId;
			}

			CourseModule.findAll({
				where: { courseSyllabusId, isActive: "Y" },
				include: [
					{
						model: CourseTasks,
						where: { isActive: "Y" },
						include: [
							{
								model: CourseTaskTypes,
								attributes: ["title"]
							},
							{
								model: CourseTaskContent,
								attributes: ["description", "videoLink", "handoutLink"]
							},
							{
								model: CourseTaskProgress,
								where: whereCourseTaskProgress,
								required: false,
								attributes: ["id", "currentTime", "percentage"]
							}
						],
						required: false,
						attributes: ["id", "title", "estimatedTime", "courseTaskTypeId", "courseModuleId", "reference"]
					}
				],
				order: [
					["id", "ASC"],
					[{ model: CourseTasks }, "id", "ASC"]
				]
			})
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Course modules and their tasks have been retrived", data: response });
				})
				.catch((err) => {
					console.log(err);
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Some error occurred.",
						err
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			description: Joi.string().required().allow(""),
			courseSyllabusId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const moduleObj = {
				title: req.body.title,
				description: req.body.description,
				courseSyllabusId: crypto.decrypt(req.body.courseSyllabusId)
			};
			CourseModule.create(moduleObj)
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Module of course syllabus has been created", data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Some error occurred."
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			description: Joi.string().required(),
			moduleId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const moduleId = crypto.decrypt(req.body.moduleId);
			const moduleObj = {
				title: req.body.title,
				description: req.body.description
			};

			const updatedModule = await CourseModule.update(moduleObj, { where: { id: moduleId } });
			if (updatedModule == 1) {
				res.status(200).send({ message: "Course module has been updated" });
			} else {
				res.status(500).send({ message: "Unable to update course module, maybe this doesn't exists" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			moduleId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const moduleId = crypto.decrypt(req.body.moduleId);
			const moduleObj = {
				isActive: "N"
			};

			const updatedModule = await CourseModule.update(moduleObj, { where: { id: moduleId } });
			if (updatedModule == 1) {
				res.status(200).send({ message: "Course module has been deleted" });
			} else {
				res.status(500).send({ message: "Unable to delete course module, maybe this doesn't exists" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

// exports.checkCourseCompletion = async (req, res) => {
// 	try {
// 		const date = new Date();
// 		const dateString = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
// 		const achivedIds = [];
// 		const courseAchievements = await CourseAchivements.findAll({
// 			where: { isActive: "Y" },
// 			attributes: ["id", "courseEnrollmentId"]
// 		});

// 		courseAchievements.forEach((e) => {
// 			achivedIds.push(e.courseEnrollmentId);
// 		});

// 		const dateOne = await CourseEnrollment.findAll({
// 			where: {
// 				isActive: "Y",
// 				id: {
// 					[Op.not]: achivedIds
// 				},
// 				[Op.and]: [
// 					{ completionDateOne: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
// 					{ completionDateTwo: { [Op.gte]: dateString } }
// 				]
// 			},
// 			include: [
// 				{
// 					model: CourseAssignment,
// 					where: {
// 						isActive: "Y",
// 						[Op.and]: [
// 							{ dateFrom: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
// 							{ dateTo: { [Op.gte]: dateString } }
// 						]
// 					},

// 					include: [
// 						{
// 							model: Course,
// 							where: {
// 								isActive: "Y",
// 								status: "P"
// 							},
// 							attributes: ["id", "title"]
// 						}
// 					],
// 					attributes: ["id", "dateFrom", "dateTo", "clientId", "courseId"]
// 				},
// 				{
// 					model: CourseEnrollmentUsers,
// 					where: {
// 						isActive: "Y"
// 					},
// 					include: [
// 						{
// 							model: User,
// 							where: { isActive: "Y" },
// 							include: [
// 								{
// 									model: User,
// 									as: "manager",
// 									attributes: ["id", "firstName", "lastName", "email"]
// 								}
// 							],
// 							attributes: ["id", "firstName", "lastName", "email", "clientId", "managerId", "roleId"]
// 						}
// 					],
// 					attributes: ["id", "courseEnrollmentId", "progress"]
// 				}
// 			],
// 			attributes: ["id", "courseAssignmentId", "completionDateOne", "completionDateTwo"]
// 		});

// 		const dateTwo = await Course.findAll({
// 			where: { isActive: "Y", status: "P" },
// 			include: [
// 				{
// 					model: CourseAssignment,
// 					where: {
// 						isActive: "Y",
// 						[Op.and]: [
// 							{ dateFrom: { [Op.lte]: dateString } }, // Records between complitionDateOne and complitionDateTwo
// 							{ dateTo: { [Op.gte]: dateString } }
// 						]
// 					},
// 					attributes: ["id", "dateFrom", "dateTo", "courseId"],
// 					include: [
// 						{
// 							model: CourseEnrollment,
// 							where: { id: { [Op.not]: achivedIds }, completionDateTwo: { [Op.lt]: dateString }, isActive: "Y" },
// 							include: [
// 								{
// 									model: CourseEnrollmentUsers,
// 									include: [
// 										{
// 											model: User,
// 											where: { isActive: "Y" },
// 											include: [
// 												{
// 													model: User,
// 													as: "manager",
// 													include: [
// 														{
// 															model: User,
// 															as: "manager",
// 															attributes: ["id", "firstName", "lastName", "email"]
// 														}
// 													],
// 													attributes: ["id", "firstName", "lastName", "email"]
// 												}
// 											],
// 											attributes: ["id", "firstName", "lastName", "email", "clientId", "managerId", "roleId"]
// 										}
// 									],
// 									attributes: ["id", "progress"]
// 								}
// 							],

// 							attributes: ["id", "courseAssignmentId", "completionDateOne", "completionDateTwo"]
// 						}
// 					]
// 				}
// 			],
// 			attributes: ["id", "title"]
// 		});

// 		const separatedUsers = await separateUsersByManager(dateOne);
// 		const organizedUsers = await dataTwo(dateTwo);

// 		emails.cornJob(separatedUsers, organizedUsers);
// 		res.send({ dateTwo, organizedUsers });
// 	} catch (err) {
// 		emails.errorEmail(req, err);
// 		console.log(err);
// 		res.status(500).send({
// 			message: err.message || "Some error occurred."
// 		});
// 	}
// };

// function groupByManagerManagersAndCourses(data) {
// 	const groupedData = {};

// 	for (const item of data) {
// 		const courseId = item.courseAssignment.course.id;

// 		for (const enrollmentUser of item.courseEnrollmentUsers) {
// 			const user = enrollmentUser.user;
// 			let manager = user.manager;

// 			// Find the top-level manager (the one with a null manager)
// 			while (manager && manager.manager) {
// 				manager = manager.manager;
// 			}

// 			const managerId = manager ? manager.id : null;

// 			if (!groupedData[managerId]) {
// 				// Create a new entry for the manager
// 				groupedData[managerId] = {};
// 			}

// 			if (!groupedData[managerId][courseId]) {
// 				// Create a new entry for the course under the manager
// 				groupedData[managerId][courseId] = {
// 					managerId: managerId,
// 					managerName: manager ? `${manager.firstName} ${manager.lastName}` : null,
// 					managerEmail: manager ? manager.email : null,
// 					courseId: courseId,
// 					courseTitle: item.courseAssignment.course.title,
// 					users: []
// 				};
// 			}

// 			// Add the user information to the manager and course's entry
// 			groupedData[managerId][courseId].users.push({
// 				userId: user.id,
// 				userName: `${user.firstName} ${user.lastName}`,
// 				userEmail: user.email,
// 				progress: enrollmentUser.progress
// 			});
// 		}
// 	}

// 	// Convert the nested structure to a flat array
// 	const result = Object.values(groupedData).reduce((acc, managerData) => {
// 		return acc.concat(Object.values(managerData));
// 	}, []);

// 	return result;
// }

// function dataTwo(data) {
// 	let updatedData = [];
// 	data.forEach((course) => {
// 		course.courseAssignments.forEach((assignment) => {
// 			assignment.courseEnrollments.forEach((enrollment) => {
// 				enrollment.courseEnrollmentUsers.forEach((enrolledUser) => {
// 					if (enrolledUser.user.manager) {
// 						if (enrolledUser.user.manager.manager) {
// 							if (typeof updatedData[enrolledUser.user.manager.manager.id] == "undefined") {
// 								updatedData[enrolledUser.user.manager.manager.id] = {
// 									manager: {
// 										id: enrolledUser.user.manager.manager.id,
// 										firstName: enrolledUser.user.manager.manager.firstName,
// 										lastName: enrolledUser.user.manager.manager.lastName,
// 										email: enrolledUser.user.manager.manager.email
// 									},
// 									courses: []
// 								};
// 							}

// 							if (typeof updatedData[enrolledUser.user.manager.manager.id].courses[course.id] == "undefined") {
// 								updatedData[enrolledUser.user.manager.manager.id].courses[course.id] = {
// 									course: {
// 										id: course.id,
// 										title: course.title,
// 										completionDateOne: enrollment.completionDateOne,
// 										completionDateTwo: enrollment.completionDateTwo
// 									},
// 									enrolledUsers: []
// 								};
// 							}

// 							updatedData[enrolledUser.user.manager.manager.id].courses[course.id].enrolledUsers.push({
// 								id: enrolledUser.user.id,
// 								firstName: enrolledUser.user.firstName,
// 								lastName: enrolledUser.user.lastName,
// 								email: enrolledUser.user.email,
// 								manager: {
// 									id: enrolledUser.user.manager.id,
// 									firstName: enrolledUser.user.manager.firstName,
// 									lastName: enrolledUser.user.manager.lastName,
// 									email: enrolledUser.user.manager.email
// 								}
// 							});
// 						}
// 					}
// 				});
// 			});
// 		});
// 	});
// 	return updatedData;
// }

// function separateUsersByManager(courseData) {
// 	const result = [];

// 	// Create a map to store users grouped by manager
// 	const managerMap = new Map();

// 	courseData.forEach((courseAssignment) => {
// 		const {
// 			courseAssignmentId,
// 			completionDateOne,
// 			completionDateTwo,
// 			courseAssignment: {
// 				courseId,

// 				course: { title }
// 			}
// 		} = courseAssignment;

// 		// Iterate through course enrollment users
// 		courseAssignment.courseEnrollmentUsers.forEach((user) => {
// 			const {
// 				user: {
// 					id: userId,
// 					firstName,
// 					lastName,
// 					email,
// 					manager: { id: managerId, firstName: managerFirstName, lastName: managerLastName, email: managerEmail }
// 				}
// 			} = user;

// 			// Create a key using managerId
// 			const key = `${courseId}-${managerId}`;

// 			// Check if key exists in managerMap
// 			if (!managerMap.has(key)) {
// 				// If not, create a new entry with course, manager, and users array
// 				managerMap.set(key, {
// 					course: { courseId, title, completionDateOne, completionDateTwo },
// 					manager: { id: managerId, firstName: managerFirstName, lastName: managerLastName, email: managerEmail },
// 					users: []
// 				});
// 			}

// 			// Push user data to the users array in managerMap
// 			managerMap.get(key).users.push({ userId, firstName, lastName, email, progress: user.progress });
// 		});
// 	});

// 	// Convert managerMap values to an array and push to result
// 	managerMap.forEach((value) => {
// 		result.push(value);
// 	});

// 	return result;
// }
