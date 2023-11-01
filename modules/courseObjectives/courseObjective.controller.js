const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseObjective = db.courseObjectives;

exports.list = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseId = crypto.decrypt(req.body.courseId);
			CourseObjective.findAll({ where: { courseId: courseId, isActive: "Y" } })
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
					res.status(200).send({ message: "Objective of Course has been created", data: response });
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

			const updatedObjective = await CourseObjective.update(objectiveObj, { where: { id: objectiveId } });
			if (updatedObjective == 1) {
				res.status(200).send({ message: "Course objectives has been updated" });
			} else {
				res.status(500).send({ message: "Unable to update course objective, maybe course objective doesnt exists" });
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

			const updatedObjective = await CourseObjective.update(objectiveObj, { where: { id: objectiveId } });
			if (updatedObjective == 1) {
				res.status(200).send({ message: "Course Objective has been deleted" });
			} else {
				res.status(500).send({ message: "Unable to delete course objective, maybe course objective doesnt exists" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
