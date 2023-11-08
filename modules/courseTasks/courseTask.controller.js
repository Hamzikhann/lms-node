const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");
const courseEnrollments = require("../../models/courseEnrollments");

const CourseModule = db.courseModules;
const CourseTasks = db.courseTasks;
const CourseTaskContent = db.courseTaskContent;
const CourseTaskTypes = db.courseTaskTypes;
const CourseTaskProgress = db.courseTaskProgress;
const CourseProgress = db.courseProgress;
const CourseAssignments = db.courseAssignments;
const Courses = db.courses;
const CourseSyllabus = db.courseSyllabus;
const CourseEnrollments = db.courseEnrollments;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			estimatedTime: Joi.string().required(),
			contentDescription: Joi.string().required(),
			contentVideoLink: Joi.string().optional().allow(""),
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
								let handoutPdf = req.file ? "uploads/documents/" + req.file.filename : null;
								const contentObj = {
									description: req.body.contentDescription,
									videoLink: req.body.contentVideoLink,
									handoutLink: handoutPdf,
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

exports.getEnrollment = async (req, res) => {
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
			const userId = crypto.decrypt(req.userId);

			const response = await CourseEnrollments.findOne({
				where: { isActive: "Y", userId },
				include: [
					{
						model: CourseAssignments,
						where: { courseId, isActive: "Y" },
						attributes: []
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
			title: Joi.string().required(),
			estimatedTime: Joi.string().required(),
			contentDescription: Joi.string().required(),
			contentVideoLink: Joi.string().optional().allow(""),
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
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const taskProgressObj = {
				currentTime: req.body.currentTime,
				percentage: req.body.percentage ? req.body.percentage : "0",
				courseTaskId: crypto.decrypt(req.body.courseTaskId),
				courseEnrollmentId: crypto.decrypt(req.body.courseEnrollmentId),
				courseId: crypto.decrypt(req.body.courseId),
				clientId: crypto.decrypt(req.clientId),
				userId: crypto.decrypt(req.userId)
			};
			let transaction = await sequelize.transaction();

			CourseTaskProgress.findOne({
				where: {
					courseTaskId: taskProgressObj.courseTaskId,
					courseEnrollmentId: taskProgressObj.courseEnrollmentId,
					userId: taskProgressObj.userId,
					courseId: taskProgressObj.courseId
				},
				isActive: "Y"
			})
				.then(async (response) => {
					// console.log(response);
					if (response) {
						CourseTaskProgress.update(
							taskProgressObj,
							{ where: { courseTaskId: taskProgressObj.courseTaskId }, isActive: "Y" },
							{ transaction }
						)
							.then(async (response) => {
								const taksProgress = await CourseTaskProgress.findAll({
									where: {
										courseEnrollmentId: taskProgressObj.courseEnrollmentId,
										userId: taskProgressObj.userId,
										courseId: taskProgressObj.courseId
									},
									attributes: ["percentage"]
								});

								var tasks = await CourseTasks.count({
									where: { isActive: "Y" },
									include: [
										{
											model: CourseModule,
											where: { isActive: "Y" },
											include: [
												{
													model: CourseSyllabus,
													where: { isActive: "Y", courseId: taskProgressObj.courseId }
												}
											],
											attributes: []
										}
									]
								});

								// check tasks count;

								var syllabusId = await CourseEnrollments.findOne({
									where: { id: crypto.decrypt(req.body.courseEnrollmentId) },
									isActive: "Y",
									include: [
										{
											model: CourseAssignments,
											where: { isActive: "Y" },
											attributes: ["id"],
											include: [
												{
													model: Courses,
													where: { isActive: "Y" },
													include: [
														{
															model: CourseSyllabus,
															where: { isActive: "Y" },
															attributes: ["id"]
														}
													],
													attributes: ["id"]
												}
											],
											attributes: ["id"]
										}
									],
									attributes: ["id"],
									raw: true
								});
								const courseSyllabusId = syllabusId["courseAssignment.course.courseSyllabus.id"];

								const allModules = await CourseModule.findAll({
									where: { courseSyllabusId: courseSyllabusId },
									isActive: "Y"
								});
								let moduleIds = [];
								allModules.forEach((e) => {
									moduleIds.push(e.id);
								});

								const allTasks = await CourseTasks.count({ where: { courseModuleId: moduleIds }, isActive: "Y" });
								// console.log(allTasks, "all ");

								let percentage = 0;
								taksProgress.forEach((e) => {
									percentage += JSON.parse(e.percentage);
								});
								// console.log(percentage, "per");
								let courseProgress = (percentage / (JSON.parse(allTasks) * 100)) * 100;

								// Find one course progress exists for client, user, enrollmentId, course
								// if exists update course progress based on id update percentage
								// if doesn't doesn't exists create new

								const courseProgressObj = {
									percentage: courseProgress,
									userId: taskProgressObj.userId,
									clientId: taskProgressObj.clientId,
									courseEnrollmentId: taskProgressObj.courseEnrollmentId
								};

								const progressCourse = await CourseProgress.update(courseProgressObj, {
									where: { courseId: taskProgressObj.courseId }
								});

								await transaction.commit();
								res.status(200).send({ message: "Task Progress updated", data: response });
							})
							.catch(async (err) => {
								await transaction.rollback();
								emails.errorEmail(req, err);
								res.status(500).send({
									message: err.message || "Some error occurred."
								});
							});
					} else {
						CourseTaskProgress.create(taskProgressObj, { transaction })
							.then(async (response) => {
								// Course Progress Update

								await transaction.commit();
								encryptHelper(response);
								res.status(200).send({ message: "Task Prohress is created for the user", data: response });
							})
							.catch(async (err) => {
								await transaction.rollback();
								emails.errorEmail(req, err);
								res.status(500).send({
									message: err.message || "Some error occurred."
								});
							});
					}
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

function courseProgressUpdate() {
	// Find one course progress exists for client, user, enrollmentId, course
	// if exists update course progress based on id update percentage
	// if doesn't doesn't exists create new
}
