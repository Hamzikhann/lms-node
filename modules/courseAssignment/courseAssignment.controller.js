const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseAssignments = db.courseAssignments;
const Course = db.courses;

exports.create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			dateFrom: Joi.string().required(),
			dateTo: Joi.string().required(),
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
				dateFrom: req.body.dateFrom,
				dataTo: req.body.dateTo,
				courseId: crypto.decrypt(req.body.courseId),
				clientId: crypto.decrypt(req.body.clientId)
			};

			CourseAssignments.create(assignmentObj)
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Course Assignment to the client is created" });
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

exports.list = (req, res) => {
	try {
		CourseAssignments.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: Course,
					where: { isActive: "Y" }
				}
			],
			attributes: { exclude: ["createdAt", "updatedAt"] }
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All assignments are retrived" });
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

exports.delete = (req, res) => {
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
			CourseAssignments.update({ isActive: "N" }, { where: { id: crypto.decrypt(req.body.courseAssignmentId) } });
			then((response) => {
				res.status(200).send({ message: "Course Assignment is deleted", data: response });
			}).catch((err) => {
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
