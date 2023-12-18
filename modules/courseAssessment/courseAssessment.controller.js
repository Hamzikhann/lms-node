const Joi = require("@hapi/joi");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const db = require("../../models");
const { sequelize } = require("../../models");

const CourseTaskAssessments = db.courseTaskAssessments;
const CourseTaskAssessmentQuestions = db.courseTaskAssessmentQuestions;

exports.list = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);
			const courseTaskAssessments = await CourseTaskAssessments.findAll({
				where: { courseTaskId, isActive: "Y" },
				include: [
					{
						model: CourseTaskAssessmentQuestions,
						where: { isActive: "Y" },
						required: false,
						attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
					}
				],
				attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
			});

			encryptHelper(courseTaskAssessments);
			res.send({
				message: "Task assessment detail has been retrieved",
				data: courseTaskAssessments
			});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Failed to fetch Course Task Assessments"
		});
	}
};

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			description: Joi.string().optional().allow(""),
			estimatedTime: Joi.string().required(),
			startTime: Joi.string().optional().allow(""),
			courseTaskId: Joi.string().required(),
			questions: Joi.array().items(
				Joi.object().keys({
					title: Joi.string().max(255).required(),
					type: Joi.string().required(),
					options: Joi.alternatives().try(Joi.string().max(255).required(), Joi.any().required()),
					answer: Joi.string().max(255).required()
				})
			)
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const assessment = {
				title: req.body.title,
				description: req.body.description,
				estimatedTime: req.body.estimatedTime,
				startTime: req.body.startTime,
				courseTaskId: crypto.decrypt(req.body.courseTaskId)
			};
			let transaction = await sequelize.transaction();
			CourseTaskAssessments.create(assessment, { transaction })
				.then(async (response) => {
					const questions = req.body.questions;
					questions.forEach((question) => {
						question.title = question.title.trim();
						question.answer = question.answer.trim();
						question.options = question.options;
						question.courseTaskAssessmentId = response.id;
					});
					await CourseTaskAssessmentQuestions.bulkCreate(questions, { transaction });
					await transaction.commit();
					encryptHelper(response);
					res.send({
						message: "Assessment has been created for the task",
						data: response
					});
				})
				.catch(async (err) => {
					if (transaction) await transaction.rollback();
					emails.errorEmail(req, err);
					res.status(500).json({
						message: err.message || "Some error occurred."
					});
				});
		}
	} catch (err) {
		if (transaction) await transaction.rollback();
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Some error occurred."
		});
	}
};

exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			description: Joi.string().optional().allow(""),
			estimatedTime: Joi.string().required(),
			startTime: Joi.string().optional().allow(""),
			courseTaskAssessmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const assessmentId = crypto.decrypt(req.body.courseTaskAssessmentId);
			const assessment = {
				title: req.body.title,
				description: req.body.description,
				estimatedTime: req.body.estimatedTime,
				startTime: req.body.startTime
			};
			const updatedObj = await CourseTaskAssessments.update(assessment, {
				where: { id: assessmentId }
			});
			if (updatedObj == 1) {
				return res.send({ message: "Task assessment has been updated" });
			} else {
				return res.status(400).send({ message: "Unable to update task assessment, maybe it was not found" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Failed to update Course Task Assessment"
		});
	}
};

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskAssessmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const assessmentId = crypto.decrypt(req.body.courseTaskAssessmentId);
			const assessment = {
				isActive: "N"
			};
			const updatedObj = await CourseTaskAssessments.update(assessment, {
				where: { id: assessmentId }
			});
			if (updatedObj == 1) {
				return res.send({ message: "Task assessment has been deleted" });
			} else {
				return res.status(400).send({ message: "Unable to delete task assessment, maybe it was not found" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Failed to delete Course Task Assessment"
		});
	}
};
