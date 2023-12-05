const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const Clients = db.clients;
const Courses = db.courses;
const CourseAssignments = db.courseAssignments;
const CourseEnrollments = db.courseEnrollments;
const CourseAchivements = db.courseAchievements;
const Users = db.users;
const UserProfile = db.userProfile;
const UserDepartments = db.userDepartments;
const UserDesignations = db.userDesignations;

exports.list = (req, res) => {
	try {
		Clients.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					required: false,
					include: [
						{
							model: Courses,
							where: { isActive: "Y" },
							attributes: ["title", "code", "level"]
						}
					],
					attributes: ["id", "courseId", "clientId"]
				}
			],
			attributes: ["id", "name", "logoURL"]
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({
					message: "Clients assigned courses list has been retrived",
					data: response
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred."
				});
			});
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
			// dateFrom: Joi.string().optional(),
			// dateTo: Joi.string().optional(),
			courseId: Joi.string().required(),
			clientId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const assignmentObj = {
				// dateFrom: req.body.dateFrom,
				// dataTo: req.body.dateTo,
				courseId: crypto.decrypt(req.body.courseId),
				clientId: crypto.decrypt(req.body.clientId)
			};
			CourseAssignments.findOne({
				where: {
					courseId: crypto.decrypt(req.body.courseId),
					clientId: crypto.decrypt(req.body.clientId),
					isActive: "Y"
				}
			})
				.then((response) => {
					if (response) {
						res.send({ message: "This course is already assigned to the client. " });
					} else {
						CourseAssignments.create(assignmentObj)
							.then((response) => {
								encryptHelper(response);
								res.status(200).send({ message: "Course has been assigned to the client", data: response });
							})
							.catch((err) => {
								emails.errorEmail(req, err);
								res.status(500).send({
									message: err.message || "Some error occurred."
								});
							});
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
			courseAssignmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.courseAssignmentId);
			const updatedObj = await CourseAssignments.update({ isActive: "N" }, { where: { id: courseAssignmentId } });

			if (updatedObj == 1) {
				res.status(200).send({ message: "Course Assignment has been deleted" });
			} else {
				res.status(200).send({ message: "Unable to delete course assignment" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.report = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseAssignmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.courseAssignmentId);
			console.log(courseAssignmentId);

			const courseDetail = await CourseAssignments.findOne({
				where: { id: courseAssignmentId, isActive: "Y" },
				include: [
					{
						model: Courses,
						where: { isActive: "Y" },
						attributes: { exclude: ["id", "createdAt", "updatedAt", "isActive", "classId", "courseDepartmentId"] }
					}
				],
				attributes: []
			});

			CourseEnrollments.findAll({
				where: { courseAssignmentId: courseAssignmentId, isActive: "Y" },
				include: [
					{
						model: CourseAchivements,
						where: { isActive: "Y" },
						attributes: ["id", "createdAt", "result"],
						required: false
					},
					{
						model: Users,
						where: { isActive: "Y" },
						include: [
							{
								model: Users,
								as: "manager",
								attributes: ["firstName", "lastName"]
							},
							{
								model: UserDepartments,
								attributes: ["title"]
							},
							{
								model: UserDesignations,
								attributes: ["title"]
							}
						],
						attributes: ["firstName", "lastName", "email"]
					}
				],
				attributes: ["id", "courseProgress"]
			})
				.then((response) => {
					encryptHelper(response);
					encryptHelper(courseDetail);
					const obj = {
						courseDetail: courseDetail,
						courseEnrollments: response
					};
					res.send({ message: "All reports of the clients are retrived", data: obj });
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
