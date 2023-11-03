const Joi = require("@hapi/joi");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const db = require("../../models");
const { sequelize } = require("../../models");

const CourseTaskAssessments = db.courseTaskAssessments;
const CourseTaskAssessmentQuestions = db.courseTaskAssessmentQuestions;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required(),
			estimatedTime: Joi.number().required(),
			startTime: Joi.string().required(),
			courseTaskId: Joi.string().required(),
			questions: Joi.array().items(
				Joi.object().keys({
					title: Joi.string().required(),
					type: Joi.string().required(),
					options: Joi.any().optional(),
					answer: Joi.string().required()
				})
			)
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
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
						question.options = JSON.stringify(question.options);
						question.courseTaskAssessmentId = response.id;
					});
					await CourseTaskAssessmentQuestions.bulkCreate({ transaction });
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
			title: Joi.string().required(),
			description: Joi.string().required(),
			estimatedTime: Joi.number().required(),
			startTime: Joi.string().required(),
			courseTaskAssesmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const assessmentId = crypto.decrypt(req.body.courseTaskAssesmentId);
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
			courseTaskAssesmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const assessmentId = crypto.decrypt(req.body.courseTaskAssesmentId);
			const assessment = {
				isActive: "N"
			};
			const updatedObj = await CourseTaskAssessments.update(assessment, {
				where: { id: assessmentId }
			});
			if (updatedObj == 1) {
				return res.send({ message: "Task assessment has been delete" });
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

exports.detail = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
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
