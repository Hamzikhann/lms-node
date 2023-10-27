const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;

const create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required().allow(""),
			courseSyllabusId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const moduleObj = {
				title: req.body.title,
				description: req.body.description,
				courseSyllabusId: crypto.decrypt(req.body.courseSyllabusId)
			};
			CourseModule.create(moduleObj)
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Module of Course and Syllabus are created", data: response });
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
		CourseModule.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseTasks,
					where: { isActive: "Y" },
					required: false
				}
			]
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All Course Modules and their Tasks are retrived", data: response });
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
			title: Joi.string().required(),
			description: Joi.string().required(),
			moduleId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const moduleId = crypto.decrypt(req.body.moduleId);
			const moduleObj = {
				title: req.body.title,
				description: req.body.description
			};

			const upatedModule = await CourseModule.update(moduleObj, { where: { id: moduleId } });

			if (upatedModule) {
				res.status(200).send({ message: "Course Modules are updated", data: upatedModule });
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
			moduleId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const moduleId = crypto.decrypt(req.body.moduleId);

			const moduleObj = {
				isActive: "N"
			};

			const module = await CourseModule.update(moduleObj, { where: { id: moduleId } });

			if (module == 1) {
				res.status(200).send({ message: "This Module is deleted", data: module });
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
