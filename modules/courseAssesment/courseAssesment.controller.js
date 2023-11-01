const { courseTaskAssessment } = require("../../models");
const { courseTaskAssessmentDetail } = require("../../models");
const { sequelize } = require("../../models");

const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const encryptHelper = require("../../utils/encryptHelper");

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required(),
			estimatedTime: Joi.number().required(),
			startTime: Joi.string().required(),
			courseTaskId: Joi.string().required(),

			question: Joi.string().optional(),
			options: Joi.array().items(Joi.string()).optional(),
			answer: Joi.string().optional(),
			type: Joi.string().optional()
		});

		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		}
		let transaction = await sequelize.transaction();

		courseTaskAssessment
			.create(
				{
					title: req.body.title,
					description: req.body.description,
					estimatedTime: req.body.estimatedTime,
					startTime: req.body.startTime,
					courseTaskId: crypto.decrypt(req.body.courseTaskId),
					isActive: "Y"
				},
				{ transaction }
			)
			.then(async (response) => {
				if (req.body.question) {
					await courseTaskAssessmentDetail.create(
						{
							question: req.body.question,
							options: req.body.options,
							answer: req.body.answer,
							type: req.body.type,
							CourseTaskAssessmentId: response.id,
							isActive: "Y"
						},
						{ transaction }
					);
				}

				await transaction.commit();
				console.log(response);
				encryptHelper(response);
				res.status(201).json({ data: response });
			})
			.catch(async (err) => {
				// if (transaction) await transaction.rollback();
				console.log(err);

				res.status(500).json({
					message: err.message || "Some error occurred."
				});
			});
	} catch (error) {
		if (transaction) await transaction.rollback();
		res.status(500).json({
			message: error.message || "Some error occurred."
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
			courseId: Joi.string().optional(),
			courseTaskAssesmentId: Joi.string().required(),
			question: Joi.string().optional(),
			options: Joi.array().items(Joi.string()).optional(),
			answer: Joi.string().optional(),
			type: Joi.string().optional(),
			courseTaskAssesmentDetailId: Joi.string().optional()
		});

		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const updatedCourseTaskAssesmentObj = {
				title: req.body.title,
				description: req.body.description,
				estimatedTime: req.body.estimatedTime,
				startTime: req.body.startTime
			};
			const updated = await courseTaskAssessment.update(updatedCourseTaskAssesmentObj, {
				where: { id: crypto.decrypt(req.body.courseTaskAssesmentId) }
			});
			if (req.body.question) {
				let assesmentsDetailObj = {
					question: req.body.question,
					options: req.body.options,
					answer: req.body.answer,
					type: req.body.type
				};
				let courseAssesmentDetail = await courseTaskAssessmentDetail.update(assesmentsDetailObj, {
					where: { id: crypto.decrypt(req.body.courseTaskAssesmentDetailId) }
				});
			}

			if (updated[0] === 1) {
				return res.status(200).json({ message: "updated", data: updated });
			} else {
				throw new Error("Course Task Assessment not found");
			}
		}
	} catch (error) {
		res.status(500).json({
			message: error.message || "Failed to update Course Task Assessment"
		});
	}
};

exports.delete = async (req, res) => {
	try {
		console.log(req.body);
		const deleted = await courseTaskAssessment.update(
			{ isActive: "N" },
			{ where: { id: crypto.decrypt(req.body.courseTaskAssesmentId) } }
		);
		console.log(deleted);
		if (deleted[0] == 1) {
			res.status(204).send({ message: "Course Task Assessment deleted" });
		} else {
			throw new Error("Course Task Assessment not found");
		}
	} catch (error) {
		res.status(500).json({
			message: error.message || "Failed to delete Course Task Assessment"
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
		}

		const courseTaskAssessments = await courseTaskAssessment.findAll({
			where: { courseTaskId: crypto.decrypt(req.body.courseTaskId) },
			include: [
				{
					model: courseTaskAssessmentDetail
				}
			]
		});
		encryptHelper(courseTaskAssessments);
		res.status(200).json(courseTaskAssessments);
	} catch (error) {
		res.status(500).json({
			message: error.message || "Failed to fetch Course Task Assessments"
		});
	}
};
