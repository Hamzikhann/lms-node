const Joi = require("@hapi/joi");

const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");

const CourseInstructor = db.courseInstructors;

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
			CourseInstructor.findAll({
				where: { courseId, isActive: "Y" }
			})
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Course Instructors list retrived", data: response });
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

exports.update = (req, res) => {
	try {
		const joiSchema = Joi.object({
			instructorId: Joi.string().required(),
			name: Joi.string().required(),
			about: Joi.string().required(),
			image: Joi.any().optional()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			var instructorId = crypto.decrypt(req.body.instructorId);
			var instructorObj = {
				name: req.body.name,
				about: req.body.about
			};
			if (req.file) {
				instructorObj.imageUrl = "uploads/instructor/" + req.file.filename;
			}
			CourseInstructor.update(instructorObj, { where: { id: instructorId } })
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
