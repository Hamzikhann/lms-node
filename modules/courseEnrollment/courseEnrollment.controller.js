const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { Op } = require("sequelize");
const { sequelize } = require("../../models");

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
const CourseTaskProgress = db.courseTaskProgress;
const CourseEnrollmentUsers = db.courseEnrollmentUsers;

exports.list = async (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);
		console.log(clientId);
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
					model: Teams,
					attributes: ["title"]
				},
				{
					model: CourseEnrollmentUsers,
					attributes: ["id"],
					include: [
						{
							model: Users,
							where: { isActive: "Y" },
							attributes: ["firstName", "lastName"]
						}
					]
				}
			],
			attributes: { exclude: ["isActive", "updatedAt"] }
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
			completionDateOne: Joi.string().optional(),
			completionDateTwo: Joi.string().optional(),
			passingThreshold: Joi.string().optional(),
			required: Joi.string().required(),
			assignmentId: Joi.string().required(),
			courseEnrollmentTypeId: Joi.string().required(),
			userDepartmentId: Joi.string().optional().allow(null).allow(""),
			userId: Joi.string().optional().allow(null).allow(""),
			teamId: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

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

			var alreadyEnrolledUsers = await CourseEnrollmentUsers.findAll({
				where: { isActive: "Y" },
				include: [
					{
						model: CourseEnrollments,
						where: { courseAssignmentId: courseAssignmentId }
					}
				],
				// , courseEnrollmentTypeId: courseEnrollmentTypeId
				attributes: ["userId"],
				raw: true
			});
			var alreadyEnrolledUsersIds = alreadyEnrolledUsers.map((obj) => obj.userId);

			var enrollmentObj;

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

				// uniqueUsers.forEach((user) => {
				// userId: user,
				enrollmentObj = {
					required: req.body.required,
					courseAssignmentId,
					courseEnrollmentTypeId,
					completionDateOne: req.body.completionDateOne ? req.body.completionDateOne : null,
					completionDateTwo: req.body.completionDateTwo ? req.body.completionDateTwo : null,
					passingThreshold: req.body.passingThreshold ? req.body.passingThreshold : null
				};
				// });
				console.log(allUsersIds);
				console.log(uniqueUsers);
			} else if (courseEnrollmentTypeId == 2) {
				var allUsers = await Users.findAll({
					where: { clientId: clientId, isActive: "Y", roleId: 3, userDepartmentId },
					attributes: ["id"],
					raw: true
				});
				var allUsersIds = allUsers.map((obj) => obj.id);
				// console.log(allUsersIds);
				// console.log(alreadyEnrolledUsersIds);

				var uniqueUsers = allUsersIds.filter((item) => !alreadyEnrolledUsersIds.includes(item));
				// uniqueUsers.forEach((user) => {
				enrollmentObj = {
					required: req.body.required,
					courseAssignmentId,
					courseEnrollmentTypeId,
					userDepartmentId,
					completionDateOne: req.body.completionDateOne ? req.body.completionDateOne : null,
					completionDateTwo: req.body.completionDateTwo ? req.body.completionDateTwo : null,
					passingThreshold: req.body.passingThreshold ? req.body.passingThreshold : null
				};
				// });
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

				var uniqueUsers = allUsersIds.filter((item) => !alreadyEnrolledUsersIds.includes(item));

				// uniqueUsers.forEach((user) => {
				enrollmentObj = {
					required: req.body.required,
					courseAssignmentId,
					courseEnrollmentTypeId,
					userDepartmentId,
					completionDateOne: req.body.completionDateOne ? req.body.completionDateOne : null,
					completionDateTwo: req.body.completionDateTwo ? req.body.completionDateTwo : null,
					passingThreshold: req.body.passingThreshold ? req.body.passingThreshold : null
				};
				// });
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

				var uniqueUsers = allUsersIds.filter((item) => !alreadyEnrolledUsersIds.includes(item));

				// uniqueUsers.forEach((user) => {
				enrollmentObj = {
					required: req.body.required,
					courseAssignmentId,
					courseEnrollmentTypeId,
					teamId,
					completionDateOne: req.body.completionDateOne ? req.body.completionDateOne : null,
					completionDateTwo: req.body.completionDateTwo ? req.body.completionDateTwo : null,
					passingThreshold: req.body.passingThreshold ? req.body.passingThreshold : null
				};
				// });
			}

			let transaction = await sequelize.transaction();
			if (uniqueUsers.length > 0) {
				CourseEnrollments.create(enrollmentObj, { transaction })
					.then(async (response) => {
						let enrolledUser = [];
						if (response) {
							uniqueUsers.forEach((e) => {
								enrolledUser.push({
									userId: e,
									courseEnrollmentId: response.id
								});
							});
							let enrollment = await CourseEnrollmentUsers.bulkCreate(enrolledUser, { transaction });
							encryptHelper(response);
							encryptHelper(enrollment);
							await transaction.commit();

							res.send({
								message: "All users have been enrolled to this course",
								data: response,
								enrollment: enrollment
							});
						}
					})
					.catch(async (err) => {
						if (transaction) await transaction.rollback();

						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred."
						});
					});
			} else {
				if (transaction) await transaction.rollback();

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

exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			completionDateOne: Joi.string().optional(),
			completionDateTwo: Joi.string().optional(),
			required: Joi.string().required(),
			courseEnrollmentId: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);
			const enrollmentObj = {
				completionDateOne: req.body.completionDateOne,
				completionDateTwo: req.body.completionDateTwo,
				required: req.body.required
			};

			CourseEnrollments.update(enrollmentObj, { where: { id: courseEnrollmentId } })
				.then((response) => {
					if (response) {
						res.send({ message: "Course Enrollment Updated..." });
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
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

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseEnrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

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

exports.detail = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseEnrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userId = crypto.decrypt(req.userId);
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);

			CourseEnrollmentUsers.findOne({
				where: { userId, courseEnrollmentId },
				isActive: "Y",
				attributes: ["progress"]
			})
				.then((response) => {
					res.send({ data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
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

exports.reset = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseEnrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);
			const userId = crypto.decrypt(req.userId);

			CourseEnrollmentUsers.update({ progress: 0 }, { where: { courseEnrollmentId, userId, isActive: "Y" } })
				.then(async (response) => {
					if (response) {
						const restTaskProgress = await CourseTaskProgress.update(
							{ percentage: "0" },
							{ where: { courseEnrollmentId, userId } }
						);
						if (restTaskProgress) {
							res.send({ message: "Coures progress and task progresses are reseted" });
						}
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
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
