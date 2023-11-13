const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const CourseAchivements = db.courseAchivements;
const CourseEnrollments = db.courseEnrollments;
const CourseAssignments = db.courseAssignments;

exports.listByUser = (req, res) => {
	try {
		const userId = crypto.decrypt(req.userId);
		CourseAchivements.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseEnrollments,
					where: { userId, isActive: "Y" },
					attributes: []
				}
			]
		})
			.then((response) => {
				encryptHelper(response);
				res.send({ data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while creating the Quiz."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};

exports.listByCourse = (req, res) => {
	try {
		console.log("course");
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

			CourseAchivements.findAll({
				where: { isActive: "Y" },
				include: [
					{
						model: CourseEnrollments,
						where: { isActive: "Y", userId: crypto.decrypt(req.userId) },
						include: [
							{
								model: CourseAssignments,
								where: { isActive: "Y", courseId },
								attributes: []
							}
						],
						attributes: []
					}
				]
			})
				.then((response) => {
					encryptHelper(response);
					res.send({ data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred while creating the Quiz."
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};
