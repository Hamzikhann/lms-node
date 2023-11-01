const Joi = require("@hapi/joi");

const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");

const CourseInstructor = db.courseInstructors;

exports.update = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required(),
			name: Joi.string().required(),
			about: Joi.string().required(),
			imageUrl: Joi.any().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			let image = "uploads/instructor/" + req.file.filename;
			const instructorObj = {
				name: req.body.name,
				about: req.body.about,
				imageUrl: image
			};

			CourseInstructor.update(instructorObj, { where: { courseId: crypto.decrypt(req.body.courseId) } })
				.then((response) => {
					res.status(200).send({ message: "Course Instructor is updated", data: response });
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

exports.detail = (req, res) => {
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
			CourseInstructor.findAll({ where: { courseId: crypto.decrypt(req.body.instructorId), isActive: "Y" } })
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Course Instructor is retrived", data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});
		}
	} catch (error) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
