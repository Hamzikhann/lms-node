const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;
const CourseTaskContent = db.courseTaskContent;
const CourseTaskTypes = db.courseTaskTypes;

exports.list = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseSyllabusId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseSyllabusId = crypto.decrypt(req.body.courseSyllabusId);
			CourseModule.findAll({
				where: { courseSyllabusId, isActive: "Y" },
				include: [
					{
						model: CourseTasks,
						where: { isActive: "Y" },
						include: [
							{
								model: CourseTaskContent,
								attributes: ["description", "videoLink", "handoutLink"]
							},
							{
								model: CourseTaskTypes,
								attributes: ["title"]
							}
						],
						required: false,
						attributes: ["id", "title", "estimatedTime", "courseTaskTypeId", "courseModuleId"]
					}
				]
			})
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Course modules and their tasks have been retrived", data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Some error occurred.",
						err
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
					res.status(200).send({ message: "Module of course syllabus has been created", data: response });
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

			const updatedModule = await CourseModule.update(moduleObj, { where: { id: moduleId } });
			if (updatedModule == 1) {
				res.status(200).send({ message: "Course module has been updated" });
			} else {
				res.status(500).send({ message: "Unable to update course module, maybe this doesn't exists" });
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

			const updatedModule = await CourseModule.update(moduleObj, { where: { id: moduleId } });
			if (updatedModule == 1) {
				res.status(200).send({ message: "Course module has been deleted" });
			} else {
				res.status(500).send({ message: "Unable to delete course module, maybe this doesn't exists" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
