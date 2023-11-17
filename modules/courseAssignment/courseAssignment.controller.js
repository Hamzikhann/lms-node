const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const Clients = db.clients;
const Courses = db.courses;
const CourseAssignments = db.courseAssignments;

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
					isActive: 'Y'
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
