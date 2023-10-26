const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseObjective = db.courseObjectives;

const create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			description: Joi.string().required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const objectiveObj = {
				description: req.body.description,
				courseId: crypto.decrypt(req.body.courseId)
			};
			CourseObjective.create(objectiveObj)
				.then((response) => {
					res.status(200).send({ message: "Objectives of Course are created", data: response });
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

const list = (req, res) => {
	try {
		CourseObjective.findAll({ where: { isActive: "Y" } })
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All Course Objectives are retrived", data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);

				res.status(500).send({
					message: "Some error occurred."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

const update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			description: Joi.string().required(),
			objectiveId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const objectiveId = crypto.decrypt(req.body.objectiveId);
			const objectiveObj = {
				description: req.body.description
			};

			const upatedObjective = await CourseObjective.update(objectiveObj, { where: { id: objectiveId } });

			if (upatedObjective) {
				res.status(200).send({ message: "Course Objectives are updated", data: upatedObjective });
			} else {
				emails.errorEmail(req, err);

				res.status(500).send({
					message: "Some error occurred."
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

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			objectiveId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const objectiveId = crypto.decrypt(req.body.objectiveId);

			const objectiveObj = {
				isActive: "N"
			};

			const objective = await CourseObjective.update(objectiveObj, { where: { id: objectiveId } });

			if (objective == 1) {
				res.status(200).send({ message: "This Objective is deleted", data: faqs });
			} else {
				emails.errorEmail(req, err);

				res.status(500).send({
					message: "Some error occurred."
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

module.exports = { create, list, update };
