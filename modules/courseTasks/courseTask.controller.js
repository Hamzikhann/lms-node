const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;
const CourseTaskContent = db.courseTaskContent;
const CourseTaskType = db.courseTaskTypes;
const create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required(),
			estimatedTime: Joi.string().required(),
			courseModuleId: Joi.string().required(),
			courseTaskTypeId: Joi.string().required(),
			contentDescription: Joi.string().required(),
			contentVideolink: Joi.string().required(),
			contentHandouts: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const taskObj = {
				title: req.body.title,
				description: req.body.description,
				estimatedTime: req.body.estimatedTime,
				courseModuleId: crypto.decrypt(req.body.courseModuleId),
				courseTaskTypeId: crypto.decrypt(req.body.courseTaskTypeId)
			};

			let transaction = await sequelize.transaction();

			CourseTasks.create(taskObj, { transaction })
				.then((task) => {
					const contentObj = {
						description: req.body.contentDescription,
						videoLink: req.body.contentVideolink,
						handoutLink: req.body.contentHandouts,
						courseTaskId: task.id
					};

					CourseTaskContent.create(contentObj, { transaction })
						.then((content) => {
							encryptHelper(content);
							encryptHelper(task);
							res.status(200).send({
								message: "Course Task and Course Content are created",
								courseTask: task,
								courseContent: content
							});
						})
						.catch(async (err) => {
							if (transaction) await transaction.rollback();
							emails.errorEmail(req, err);
							res.status(500).send({
								message: err.message || "Some error occurred while creating the Quiz."
							});
						});
				})
				.catch(async (err) => {
					if (transaction) await transaction.rollback();
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred while creating the Quiz."
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
		CourseTasks.findAll({
			where: { isActive: "Y" }
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All Course Task are retrived", data: response });
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

const detail = async (req, res) => {
	try {
		const courseTaskId = crypto.decrypt(req.body.courseTaskId);

		CourseTasks.findOne({
			where: { id: courseTaskId },
			include: [
				{
					model: CourseTaskContent,
					where: { isActive: "Y" }
				},
				{
					modal: CourseTaskType,
					where: { isActive: "Y" }
				}
			]
		}).then((response) => {
			encryptHelper(response);
			res.status(200).send({ message: "The detail of the Course Task is retrived", data: response });
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
			estimatedTime: Joi.string().required(),
			contentDescription: Joi.string().required(),
			contentVideolink: Joi.string().required(),
			contentHandouts: Joi.string().required(),
			courseTaskId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);
			const taskObj = {
				title: req.body.title,
				description: req.body.description,
				estimatedTime: req.body.estimatedTime
			};

			const upatedTask = await CourseTasks.update(taskObj, { where: { id: courseTaskId } });

			if (upatedTask) {
				const contentObj = {
					description: req.body.contentDescription,
					videoLink: req.body.contentVideolink,
					handoutLink: req.body.contentHandouts
				};
				const updateContem = CourseTaskContent.update(contentObj, { where: { courseTaskId: courseTaskId } });

				res.status(200).send({ message: "Course Modules are updated", data: upatedTask });
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
			courseTaskId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);

			const taskObj = {
				isActive: "N"
			};
			const contentObj = {
				isActive: "N"
			};

			const task = await CourseTasks.update(taskObj, { where: { id: courseTaskId } });

			if (task == 1) {
				const content = await CourseTaskContent.update(contentObj, { where: { id: courseTaskId } });

				res.status(200).send({ message: "This Module is deleted", data: task });
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

module.exports = { create, list, update, detail };
