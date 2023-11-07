const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { Op } = require("sequelize");

const Users = db.users;
const Clients = db.clients;
const Courses = db.courses;
const CourseDepartments = db.courseDepartments;
const CourseAssignments = db.courseAssignments;
const CourseEnrollments = db.courseEnrollments;
const CourseEnrollmentTypes = db.courseEnrollmentTypes;
const UserDepartments = db.userDepartments;
const Teams = db.teams;
const TeamUsers = db.teamUsers;

exports.list = async (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);
		const enrollments = await CourseEnrollments.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseEnrollmentTypes,
					attributes: ["title"]
				},
				{
					model: CourseAssignments,
					where: { clientId, isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y", status: "P" },
							attributes: ["title", "code", "level", "language", "level"]
						}
					],
					attributes: ["id", "courseId"]
				},
				{
					model: UserDepartments,
					attributes: ["title"]
				},
				{
					model: Users,
					attributes: ["firstName", "lastName"]
				}
			],
			attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
		});
		encryptHelper(enrollments);
		res.send({
			message: "Assigned courses enrollments list retrieved",
			data: enrollments
		});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.listTypes = async (req, res) => {
	try {
		const types = await CourseEnrollmentTypes.findAll({
			where: { isActive: "Y" },
			attributes: { exclude: ["isActive", "createdAt", "updatedAt", "userDepartmentId"] }
		});

		encryptHelper(types);
		res.send({
			message: "Enrollment Types list retrieved",
			data: types
		});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			required: Joi.string().required(),
			assignmentId: Joi.string().required(),
			courseEnrollmentTypeId: Joi.string().required(),
			userDepartmentId: Joi.string().optional().allow(null).allow(""),
			userId: Joi.string().optional().allow(null).allow(""),
			teamsId: Joi.string().optional()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.assignmentId);
			const courseEnrollmentTypeId = req.body.courseEnrollmentTypeId
				? crypto.decrypt(req.body.courseEnrollmentTypeId)
				: null;
			const userDepartmentId = req.body.userDepartmentId ? crypto.decrypt(req.body.userDepartmentId) : null;
			const userId = req.body.userId ? crypto.decrypt(req.body.userId) : null;
			const teamId = req.body.teamsId ? crypto.decrypt(req.body.teamsId) : null;
			// const enrollmentExists = await CourseEnrollments.findOne({
			// 	where: {
			// 		courseAssignmentId: courseAssignmentId,
			// 		isActive: "Y"
			// 	}
			// });
			if (courseEnrollmentTypeId == 1) {
				if (enrollmentExists) {
					res.status(401).send({
						message: "Unable to enroll course, it is already enrolled to all users.."
					});
				} else {
					const enrollmentObj = {
						required: req.body.required,
						courseEnrollmentTypeId,
						courseAssignmentId,
						userDepartmentId,
						userId,
						teamId
					};
					console.log(enrollmentObj);
					const response = await CourseEnrollments.create(enrollmentObj);
					encryptHelper(response);
					res.send({
						message: "All users have been enrolled to this course already",
						data: response
					});
				}
			}
			// else if (courseEnrollmentTypeId == 2) {
			// 	if (enrollmentExists && enrollmentExists.userDepartmentId == userDepartmentId) {
			// 		res.status(401).send({
			// 			message: "Unable to enroll course, it is already enrolled to this department."
			// 		});
			// 	}
			// } else if (courseEnrollmentTypeId == 3) {
			// 	if (enrollmentExists && enrollmentExists.userId == userId) {
			// 		res.status(401).send({
			// 			message: "Unable to enroll course, it is already enrolled to this user."
			// 		});
			// 	}
			// }
			else if (courseEnrollmentTypeId == 4) {
				if (enrollmentExists && enrollmentExists.courseEnrollmentTypeId == 1) {
					res.status(401).send({
						message: "Unable to enroll course, it is already enrolled to all users.."
					});
				} else {
					if (enrollmentExists && enrollmentExists.teamId == teamId) {
						res.status(401).send({
							message: "Unable to enroll course, it is already enrolled to this Team."
						});
					} else {
						const enrollmentObj = {
							required: req.body.required,
							courseEnrollmentTypeId,
							courseAssignmentId,
							userDepartmentId,
							userId,
							teamId
						};
						console.log(enrollmentObj);
						const response = await CourseEnrollments.create(enrollmentObj);
						encryptHelper(response);
						res.send({
							message: "All users have been enrolled to this course already",
							data: response
						});
					}
				}
			}
			// else {
			// 	console.log(888);
			// 	const enrollmentObj = {
			// 		required: req.body.required,
			// 		courseEnrollmentTypeId,
			// 		courseAssignmentId,
			// 		userDepartmentId,
			// 		userId,
			// 		teamsId
			// 	};
			// 	const response = await CourseEnrollments.create(enrollmentObj);
			// 	encryptHelper(response);
			// 	res.send({
			// 		message: "All users have been enrolled to this course already",
			// 		data: response
			// 	});
			// }
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
			courseEnrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const enrollmentId = crypto.decrypt(req.body.courseEnrollmentId);
			const enrollment = { isActive: "N" };

			const updatedObj = await CourseEnrollments.update(enrollment, {
				where: { id: enrollmentId, isActive: "Y" }
			});

			if (updatedObj == 1) {
				res.status(200).send({
					message: "Course enrollment deleted"
				});
			} else {
				res.status(400).send({
					message: "Unable to delete course enrollment, maybe it doesn't exists"
				});
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			required: Joi.string().required(),
			assignmentId: Joi.string().required(),
			courseEnrollmentTypeId: Joi.string().required(),
			userDepartmentId: Joi.string().optional().allow(null).allow(""),
			userId: Joi.string().optional().allow(null).allow(""),
			teamId: Joi.string().optional()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.assignmentId);
			const courseEnrollmentTypeId = req.body.courseEnrollmentTypeId
				? crypto.decrypt(req.body.courseEnrollmentTypeId)
				: null;
			const userDepartmentId = req.body.userDepartmentId ? crypto.decrypt(req.body.userDepartmentId) : null;
			const userId = req.body.userId ? crypto.decrypt(req.body.userId) : null;
			const teamId = req.body.teamId ? crypto.decrypt(req.body.teamId) : null;
			const clientId = crypto.decrypt(req.clientId);

			var alreadyEnrolledUsers = await CourseEnrollments.findAll({
				where: { courseAssignmentId, isActive: "Y" },
				attributes: ["userId"],
				raw: true
			});
			var alreadyEnrolledUsersIds = alreadyEnrolledUsers.map((obj) => obj.userId);

			var enrollmentArr = [];

			if (courseEnrollmentTypeId == 1) {
				var allUsers = await Users.findAll({
					where: { clientId: clientId, isActive: "Y", roleId: 3 },
					attributes: ["id"],
					raw: true
				});
				var allUsersIds = allUsers.map((obj) => obj.id);

				var uniqueUsers = allUsersIds
					.filter((item) => !alreadyEnrolledUsersIds.includes(item))
					.concat(alreadyEnrolledUsersIds.filter((item) => !allUsersIds.includes(item)));

				uniqueUsers.forEach((user) => {
					enrollmentArr.push({
						userId: user,
						required: req.body.required,
						courseAssignmentId,
						courseEnrollmentTypeId
					});
				});
			} else if (courseEnrollmentTypeId == 2) {
				var allUsers = await Users.findAll({
					where: { clientId: clientId, isActive: "Y", roleId: 3, userDepartmentId },
					attributes: ["id"],
					raw: true
				});
				var allUsersIds = allUsers.map((obj) => obj.id);
				console.log(allUsersIds);
				console.log(alreadyEnrolledUsersIds);
				// var uniqueUsers = allUsersIds
				// 	.filter((item) => !alreadyEnrolledUsersIds.includes(item))
				// 	.concat(alreadyEnrolledUsersIds.filter((item) => !allUsersIds.includes(item)));

				var uniqueUsers = allUsersIds.filter((item) => !alreadyEnrolledUsersIds.includes(item));
				uniqueUsers.forEach((user) => {
					enrollmentArr.push({
						userId: user,
						required: req.body.required,
						courseAssignmentId,
						courseEnrollmentTypeId,
						userDepartmentId
					});
				});
				console.log(uniqueUsers);
			} else if (courseEnrollmentTypeId == 3) {
				var allUsers = await Users.findAll({
					where: { clientId: clientId, isActive: "Y", roleId: 3, id: userId },
					attributes: ["id"],
					raw: true
				});
				var allUsersIds = allUsers.map((obj) => obj.id);
				console.log(allUsersIds);
				console.log(alreadyEnrolledUsers);
				// var uniqueUsers = allUsersIds
				// 	.filter((item) => !alreadyEnrolledUsersIds.includes(item))
				// 	.concat(alreadyEnrolledUsersIds.filter((item) => !allUsersIds.includes(item)));
				var uniqueUsers = allUsersIds.filter((item) => !alreadyEnrolledUsersIds.includes(item));

				uniqueUsers.forEach((user) => {
					enrollmentArr.push({
						userId: user,
						required: req.body.required,
						courseAssignmentId,
						courseEnrollmentTypeId,
						userDepartmentId
					});
				});
				console.log(uniqueUsers);
			} else if (courseEnrollmentTypeId == 4) {
				var allUsers = await TeamUsers.findAll({
					where: { teamId, clientId, isActive: "Y" },
					include: [
						{
							model: Users,
							where: { roleId: 3 },
							attributes: []
						}
					],
					attributes: ["userId"],
					raw: true
				});
				var allUsersIds = allUsers.map((obj) => obj.userId);

				var uniqueUsers = allUsersIds
					.filter((item) => !alreadyEnrolledUsersIds.includes(item))
					.concat(alreadyEnrolledUsersIds.filter((item) => !allUsersIds.includes(item)));

				uniqueUsers.forEach((user) => {
					enrollmentArr.push({
						userId: user,
						required: req.body.required,
						courseAssignmentId,
						courseEnrollmentTypeId,
						teamId
					});
				});
			}

			if (enrollmentArr.length > 0) {
				CourseEnrollments.bulkCreate(enrollmentArr)
					.then((response) => {
						encryptHelper(response);
						res.send({ message: "All users have been enrolled to this course", data: response });
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred."
						});
					});
			} else {
				res.send({ message: "Users already enrolled to this course", data: [] });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
