const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;
const CourseTaskContent = db.courseTaskContent;
const CourseTaskTypes = db.courseTaskTypes;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			estimatedTime: Joi.string().required(),
			contentDescription: Joi.string().required(),
			contentVideoLink: Joi.string().required(),
			contentHandoutLink: Joi.string().required(),
			courseTaskTypeId: Joi.string().required(),
			courseModuleId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			CourseTasks.findOne({
				where: {
					title: req.body.title.trim(),
					estimatedTime: req.body.estimatedTime,
					courseModuleId: crypto.decrypt(req.body.courseModuleId),
					courseTaskTypeId: crypto.decrypt(req.body.courseTaskTypeId)
				}
			})
				.then(async (response) => {
					if (response) {
						res.status(200).send({ message: "This Course Task already exists." });
					} else {
						const taskObj = {
							title: req.body.title,
							estimatedTime: req.body.estimatedTime,
							courseModuleId: crypto.decrypt(req.body.courseModuleId),
							courseTaskTypeId: crypto.decrypt(req.body.courseTaskTypeId)
						};
						let transaction = await sequelize.transaction();

						CourseTasks.create(taskObj, { transaction })
							.then((task) => {
								const contentObj = {
									description: req.body.contentDescription,
									videoLink: req.body.contentVideoLink,
									handoutLink: req.body.contentHandoutLink,
									courseTaskId: task.id
								};
								CourseTaskContent.create(contentObj, { transaction })
									.then(async (content) => {
										await transaction.commit();
										encryptHelper(task);
										encryptHelper(content);
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
			message: err.message || "Some error occurred."
		});
	}
};

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
			CourseTasks.findAll({
				where: { isActive: "Y" },
				include: [
					{
						model: CourseModule,
						where: { courseId, isActive: "Y" },
						attributes: []
					}
				],
				attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
			})
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "All Course Tasks are retrived", data: response });
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

exports.listTypes = (req, res) => {
	try {
		CourseTaskTypes.findAll({
			where: { isActive: "Y" },
			attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All Course Tasks are retrived", data: response });
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

exports.detail = async (req, res) => {
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
			const response = await CourseTasks.findOne({
				where: { id: courseTaskId, isActive: "Y" },
				include: [
					{
						model: CourseTaskContent,
						attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
					},
					{
						model: CourseTaskTypes,
						attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
					}
				]
			});
			encryptHelper(response);
			res.status(200).send({ message: "The course task detail has been retrived", data: response });
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
			estimatedTime: Joi.string().required(),
			contentDescription: Joi.string().required(),
			contentVideoLink: Joi.string().required(),
			contentHandoutLink: Joi.string().required(),
			courseTaskTypeId: Joi.string().required(),
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
				estimatedTime: req.body.estimatedTime,
				courseTaskTypeId: crypto.decrypt(req.body.courseTaskTypeId)
			};

			const updatedTask = await CourseTasks.update(taskObj, { where: { id: courseTaskId } });
			if (updatedTask == 1) {
				const contentObj = {
					description: req.body.contentDescription,
					videoLink: req.body.contentVideoLink,
					handoutLink: req.body.contentHandoutLink
				};
				const updateContent = await CourseTaskContent.update(contentObj, { where: { courseTaskId: courseTaskId } });

				res.status(200).send({ message: "Course Modules are updated" });
			} else {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: "Failed to update task detail, maybe the task doesn't exists."
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

			const taskObj = { isActive: "N" };
			const contentObj = { isActive: "N" };

			const task = await CourseTasks.update(taskObj, { where: { id: courseTaskId } });
			if (task == 1) {
				const content = await CourseTaskContent.update(contentObj, { where: { courseTaskId: courseTaskId } });
				res.status(200).send({ message: "This task has been deleted" });
			} else {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: "Unable to delete the task, maybe the task doesn't exists."
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
