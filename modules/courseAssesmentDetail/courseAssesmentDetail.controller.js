const { courseTaskAssessmentDetail } = require("../../models");
const Joi = require("@hapi/joi");
const crypto = require("../../utils/crypto");
const encryptHelper = require("../../utils/encryptHelper");

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			question: Joi.string().required(),
			options: Joi.array().items(Joi.string()).required(),
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
		const CourseTaskAssessmentDetail = await courseTaskAssessmentDetail.create({
			question: req.body.question,
			options: JSON.stringify(req.body.options),
			answer: req.body.answer,
			type: req.body.type,
			courseTaskAssessmentId: crypto.decrypt(req.body.courseTaskAssessmentId),
			isActive: "Y"
		});
		encryptHelper(CourseTaskAssessmentDetail);
		res.status(201).json({ message: "question created", data: CourseTaskAssessmentDetail });
	} catch (error) {
		res.status(500).json({ error: "Failed to create Course Task Assessment Detail" });
	}
};

exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			question: Joi.string(),
			options: Joi.array().items(Joi.string()),
			answer: Joi.string(),
			type: Joi.string(),
			courseTaskAssesmentDetailId: Joi.string()
		});

		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		}

		const updated = await courseTaskAssessmentDetail.update(req.body, {
			where: { id: crypto.decrypt(req.body.courseTaskAssesmentDetailId) }
		});

		if (updated[0]) {
			res.status(200).json({ message: "Question is updated", data: updated });
		} else {
			res.status(404).json({ message: "Course Task Assessment Detail not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to update Course Task Assessment Detail" });
	}
};

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskAssessmentId: Joi.string().required()
		});

		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const updated = await courseTaskAssessmentDetail.update(
				{ isActive: "N" },
				{ where: { id: crypto.decrypt(req.body.courseTaskAssessmentId) } }
			);

			if (updated[0]) {
				res.status(204).send("Course Task Assessment Detail deleted");
			} else {
				res.status(404).json({ message: "Course Task Assessment Detail not found" });
			}
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to delete Course Task Assessment Detail" });
	}
};

exports.detail = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskAssessmentId: Joi.string().required()
		});

		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		}

		const courseTaskAssessmentDetails = await courseTaskAssessmentDetail.findAll({
			where: { courseTaskAssessmentId: crypto.decrypt(req.body.courseTaskAssessmentId), isActive: "Y" }
		});
		encryptHelper(courseTaskAssessmentDetails);
		res.status(200).json(courseTaskAssessmentDetails);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch Course Task Assessment Details" });
	}
};
