const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");
const Op = db.Sequelize.Op;

const Courses = db.courses;
const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;
const CourseTaskContent = db.courseTaskContent;
const CourseTaskTypes = db.courseTaskTypes;
const CourseTaskProgress = db.courseTaskProgress;
const CourseAssignments = db.courseAssignments;
const CourseAchievements = db.courseAchievements;
const CourseSyllabus = db.courseSyllabus;
const CourseEnrollments = db.courseEnrollments;
const CourseEnrollmentUsers = db.courseEnrollmentUsers;
const Transcript = db.transcript;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			estimatedTime: Joi.string().max(255).required(),
			contentDescription: Joi.string().optional().allow(""),
			contentVideoLink: Joi.string().optional().allow(""),
			reference: Joi.string().optional().allow(""),
			courseTaskTypeId: Joi.string().required(),
			courseModuleId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

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
							courseTaskTypeId: crypto.decrypt(req.body.courseTaskTypeId),
							reference: req.body.reference ? req.body.reference : null
						};
						let transaction = await sequelize.transaction();

						CourseTasks.create(taskObj, { transaction })
							.then(async (task) => {
								let handoutPdf = req.file ? "uploads/documents/" + req.file.filename : null;
								const contentObj = {
									description: req.body.contentDescription,
									videoLink: req.body.contentVideoLink,
									handoutLink: handoutPdf,
									courseTaskId: task.id
								};
								const transcript = await Transcript.create({ courseTaskId: task.id }, { transaction });

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
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);
			const userId = crypto.decrypt(req.userId);

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
					},
					{
						model: Transcript,
						attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
					},
					{
						model: CourseTaskProgress,
						where: { courseTaskId, userId, isActive: "Y" },
						required: false,
						attributes: ["id", "percentage"]
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

exports.detailForUser = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required(),
			courseTaskId: Joi.string().required(),
			courseEnrollmentId: Joi.string().required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseId = crypto.decrypt(req.body.courseId);
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);
			const userId = crypto.decrypt(req.userId);
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);

			const courseTask = await CourseTasks.findAll({
				where: { isActive: "Y" },
				include: [
					{
						model: CourseModule,
						where: { isActive: "Y" },
						include: [
							{
								model: CourseSyllabus,
								where: { isActive: "Y" },
								include: [
									{
										model: Courses,
										where: { id: courseId, isActive: "Y" },
										attributes: []
									}
								],
								attributes: []
							}
						],
						attributes: []
					}
				],
				attributes: ["id"],
				orderby: [["id", "ASC"]]
			});

			let previousTaskId = null;
			courseTask.forEach((e, index) => {
				if (e.id == courseTaskId) {
					previousTaskId = typeof courseTask[index - 1] !== "undefined" ? courseTask[index - 1]["id"] : null;
				}
			});

			var statusCode = 200;
			var message = "";

			if (previousTaskId) {
				const previousTask = await CourseTaskProgress.findOne({
					where: { courseTaskId: previousTaskId, courseEnrollmentId, isActive: "Y" },
					attributes: ["id", "percentage"]
				});

				if (previousTask && previousTask.percentage != "0") {
					message = "The course task detail has been retrived";
				} else {
					message = "Please complete your previous task";
					statusCode = 400;
				}
			} else {
				message = "The course task detail has been retrived";
			}

			if (statusCode == 200) {
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
						},
						{
							model: Transcript,
							attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
						},
						{
							model: CourseTaskProgress,
							where: { courseTaskId, userId, isActive: "Y", courseEnrollmentId: courseEnrollmentId },
							required: false,
							attributes: ["id", "percentage"]
						}
					]
				});
				encryptHelper(response);
				res.status(200).send({ message, data: response });
			} else {
				res.status(400).send({ message, data: null });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.getEnrollment = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseId = crypto.decrypt(req.body.courseId);
			const userId = crypto.decrypt(req.userId);

			const response = await CourseEnrollments.findOne({
				where: { isActive: "Y" },
				include: [
					{
						model: CourseAssignments,
						where: { courseId, isActive: "Y" },
						attributes: []
					},
					{
						model: CourseEnrollmentUsers,
						where: { userId: userId, isActive: "Y" }
					}
				],
				attributes: ["id"]
			});
			encryptHelper(response);
			res.status(200).send({ message: "The course enrollment detail has been retrived", data: response });
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
			title: Joi.string().max(255).required(),
			estimatedTime: Joi.string().required(),
			contentDescription: Joi.string().optional().allow(""),
			contentVideoLink: Joi.string().optional().allow(""),
			reference: Joi.string().optional().allow(""),
			courseTaskTypeId: Joi.string().required(),
			courseTaskId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);
			const taskObj = {
				title: req.body.title,
				estimatedTime: req.body.estimatedTime,
				reference: req.body.reference ? req.body.reference : null,
				courseTaskTypeId: crypto.decrypt(req.body.courseTaskTypeId)
			};

			const updatedTask = await CourseTasks.update(taskObj, { where: { id: courseTaskId } });
			if (updatedTask == 1) {
				let handoutPdf = req.file ? "uploads/documents/" + req.file.filename : req.body.handout;

				const contentObj = {
					description: req.body.contentDescription,
					videoLink: req.body.contentVideoLink,
					handoutLink: handoutPdf
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
			emails.errorEmail(req, error);

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

exports.createProgress = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			currentTime: Joi.string().optional().allow(""),
			percentage: Joi.string().required(),
			courseTaskId: Joi.string().required(),
			courseEnrollmentId: Joi.string().required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const clientId = crypto.decrypt(req.clientId);
			const courseId = crypto.decrypt(req.body.courseId);
			const userId = crypto.decrypt(req.userId);
			const courseTaskId = crypto.decrypt(req.body.courseTaskId);
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);

			let taskProgressExists = await CourseTaskProgress.findOne({
				where: {
					isActive: "Y",
					courseEnrollmentId,
					courseTaskId,
					userId,
					courseId
				}
			});

			if (taskProgressExists) {
				const progressId = taskProgressExists.id;
				await CourseTaskProgress.update(
					{
						currentTime: req.body.currentTime,
						percentage: req.body.percentage
					},
					{ where: { id: progressId, isActive: "Y" } }
				)
					.then(async (response) => {
						if (response) {
							await courseProgressUpdate(clientId, userId, courseId, courseEnrollmentId);

							res.status(200).send({ message: "Task Progress has been updated for the assigned course" });
						} else {
							res.send(500).send({ message: "Unable to update task progress" });
						}
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred."
						});
					});
				// console.log("Task progress exists updating: ", updatedProgressTask);
			} else {
				console.log("task progress doesn't exists");
				await CourseTaskProgress.create({
					currentTime: req.body.currentTime,
					percentage: req.body.percentage ? req.body.percentage : "0",
					courseTaskId,
					courseEnrollmentId,
					courseId,
					clientId,
					userId
				})
					.then(async (response) => {
						if (response) {
							await courseProgressUpdate(clientId, userId, courseId, courseEnrollmentId);

							res.status(200).send({ message: "Task Progress has been created for the assigned course" });
						} else {
							res.send(500).send({ message: "Unable to update task progress" });
						}
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred."
						});
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

async function courseProgressUpdate(clientId, userId, courseId, courseEnrollmentId) {
	const existedProgress = await CourseEnrollments.findOne({
		where: { id: courseEnrollmentId, isActive: "Y" },
		include: [
			{
				model: CourseEnrollmentUsers,
				where: { isActive: "Y", userId: userId },
				attributes: ["id", "progress"]
			}
		],
		attributes: ["id"]
	});
	// console.log(existedProgress.courseProgress);
	var allTasksCount = await CourseTasks.count({
		where: { isActive: "Y" },
		include: [
			{
				model: CourseModule,
				where: { isActive: "Y" },
				include: [
					{
						model: CourseSyllabus,
						where: { isActive: "Y", courseId }
					}
				],
				attributes: []
			}
		]
	});

	var allTasksProgress = await CourseTaskProgress.findAll({
		where: { courseEnrollmentId, userId, courseId, isActive: "Y" },
		attributes: ["percentage"]
	});

	let percentage = 0;
	let percentageAchievement = 0;
	allTasksProgress.forEach((e) => {
		percentage += e.percentage != "0" ? 100 : 0;
		percentageAchievement += JSON.parse(e.percentage);
	});
	let courseProgress = Math.floor((percentage / (allTasksCount * 100)) * 100);
	let achievementProgress = Math.floor((percentageAchievement / (allTasksCount * 100)) * 100);

	const courseProgressUpdated = await CourseEnrollmentUsers.update(
		{ progress: courseProgress },
		{ where: { courseEnrollmentId: courseEnrollmentId, userId: userId, isActive: "Y" } }
	);

	if (courseProgress == 100 && existedProgress.courseEnrollmentUsers.progress != 100) {
		const achivements = await CourseAchievements.create({
			courseEnrollmentUserId: existedProgress.courseEnrollmentUsers[0].id,
			result: achievementProgress
		});
	}

	// console.log("Course progresss exists so updating ", courseProgressUpdated);
	return 1;
}

exports.nextCourse = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseEnrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);
			const userId = crypto.decrypt(req.userId);

			const allTasks = await CourseTaskProgress.findAll({
				where: {
					courseEnrollmentId: courseEnrollmentId,
					userId: userId,
					isActive: "Y"
				},
				include: [
					{
						model: CourseTasks,
						where: { isActive: "Y" },
						attributes: ["id"]
					}
				],
				attributes: ["id", "percentage"]
			});

			let taskTodo = allTasks.length ? allTasks[0] : null;
			allTasks.forEach((task, key) => {
				task.id = key;
				if (task.percentage != "0") {
					taskTodo = allTasks[key + 1] ? allTasks[key + 1] : null;
				}
			});

			if (taskTodo) {
				encryptHelper(taskTodo);
				res.send({ message: "Resume task", data: taskTodo });
			} else {
				encryptHelper(allTasks[0]);
				res.send({ message: "Resume task", data: allTasks[0] });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
