const Joi = require("@hapi/joi");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const db = require("../../models");
const { sequelize } = require("../../models");

const CourseTaskAssessmentQuestions = db.courseTaskAssessmentQuestions;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			options: Joi.any().optional(),
			answer: Joi.string().required(),
			type: Joi.string().required(),
			courseTaskAssessmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		}
		const question = {
			title: req.body.title,
			options: JSON.stringify(req.body.options),
			answer: req.body.answer,
			type: req.body.type,
			courseTaskAssessmentId: crypto.decrypt(req.body.courseTaskAssessmentId)
		};

		CourseTaskAssessmentQuestions.create(question)
			.then(async (response) => {
				encryptHelper(response);
				res.send({
					message: "Assessment question has been created",
					data: response
				});
			})
			.catch(async (err) => {
				emails.errorEmail(req, err);
				res.status(500).json({
					message: err.message || "Some error occurred."
				});
			});
	} catch (err) {
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
			options: Joi.any().optional(),
			answer: Joi.string().required(),
			type: Joi.string().required(),
			courseTaskAssessmentQuestonId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const courseTaskAssessmentQuestonId = crypto.decrypt(req.body.courseTaskAssessmentQuestonId);
			const assessmentQuestion = {
				title: req.body.title,
				options: JSON.stringify(req.body.options),
				answer: req.body.answer,
				type: req.body.type
			};

			const updatedObj = await CourseTaskAssessmentQuestions.update(assessmentQuestion, {
				where: { id: courseTaskAssessmentQuestonId }
			});
			if (updatedObj == 1) {
				res.send({ message: "Task assessment question has been updated" });
			} else {
				res.status(400).json({ message: "Unable to update task assessment question, maybe it was not found" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Some error occurred."
		});
	}
};

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskAssessmentQuestionId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const courseTaskAssessmentQuestionId = crypto.decrypt(req.body.courseTaskAssessmentQuestionId);
			const assessmentQuestion = {
				isActive: "N"
			};

			const updatedObj = await CourseTaskAssessmentQuestions.update(assessmentQuestion, {
				where: { id: courseTaskAssessmentQuestionId }
			});
			if (updatedObj == 1) {
				res.send({ message: "Task assessment question has been deleted" });
			} else {
				res.status(400).json({ message: "Unable to delete task assessment question, maybe it was not found" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Some error occurred."
		});
	}
};
