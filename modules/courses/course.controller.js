const Joi = require("@hapi/joi");
const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const { sequelize } = require("../../models");
const Sequelize = require("sequelize");

const Classes = db.classes;
const Courses = db.courses;
const learningPaths = db.learningPaths;
const courseBooks = db.courseBooks;
const courseDepartment = db.courseDepartments;
const courseAssignments = db.courseAssignments;
const CourseEnrollments = db.courseEnrollments;
const CourseEnrollmentUsers = db.courseEnrollmentUsers;
const courseFaqs = db.courseFaqs;
const courseInstructor = db.courseInstructors;
const courseObjectives = db.courseObjectives;
const courseUsefulLinks = db.courseUsefulLinks;
const courseSyllabus = db.courseSyllabus;
const courseModule = db.courseModules;
const courseTasks = db.courseTasks;
const courseTaskTypes = db.courseTaskTypes;
const CourseTaskProgress = db.courseTaskProgress;
const User = db.users;
const CourseAchievements = db.courseAchievements;

exports.list = (req, res) => {
	try {
		Courses.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: courseDepartment,
					where: { isActive: "Y" },
					required: false,
					attributes: ["title"]
				}
			],
			attributes: ["id", "code", "title"]
		})
			.then((data) => {
				encryptHelper(data);
				res.send(data);
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Classes."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.listForClient = (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);

		courseAssignments
			.findAll({
				where: { clientId, isActive: "Y" },
				include: [
					{
						model: Courses,
						where: { isActive: "Y", status: "P" },
						include: [
							{
								model: courseDepartment,
								where: { isActive: "Y" },
								required: false,
								attributes: ["title"]
							}
						],
						attributes: ["title", "code"]
					}
				],
				attributes: ["courseId", "id"]
			})
			.then((data) => {
				encryptHelper(data);

				var updatedRes = [];
				data.forEach((element) => {
					const course = {
						id: element.courseId,
						code: element.course.code,
						title: element.course.title,
						courseDepartment: element.course.courseDepartment,
						courseAssignmentId: element.id,
						tasks: {
							total: 0,
							completed: 0
						}
					};
					updatedRes.push(course);
				});

				res.send(updatedRes);
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Classes."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.listForUser = (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);
		const userId = crypto.decrypt(req.userId);

		CourseEnrollments.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: courseAssignments,
					where: { clientId, isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y", status: "P" },
							include: [
								{
									model: courseDepartment,
									where: { isActive: "Y" },
									required: false,
									attributes: ["title"]
								},
								{
									model: courseSyllabus,
									where: { isActive: "Y" },
									required: false,
									attributes: ["id"],
									include: [
										{
											model: courseModule,
											where: { isActive: "Y" },
											required: false,
											attributes: ["id"],
											include: [
												{
													model: courseTasks,
													where: { isActive: "Y" },
													required: false,
													attributes: ["id"]
												}
											]
										}
									]
								}
							],
							attributes: ["title", "code"]
						}
					],
					attributes: ["id", "courseId"]
				},
				{
					model: CourseEnrollmentUsers,
					where: { userId, isActive: "Y" },
					attributes: []
				},
				{
					model: CourseTaskProgress,
					where: { isActive: "Y", userId },
					required: false,
					attributes: ["courseTaskId", "percentage"]
				}
			],
			attributes: ["id", "required", "completionDateOne"]
		})
			.then(async (data) => {
				encryptHelper(data);

				var updatedRes = [];
				await data.forEach((element) => {
					const course = {
						id: element.courseAssignment.courseId,
						code: element.courseAssignment.course.code,
						title: element.courseAssignment.course.title,
						courseDepartment: element.courseAssignment.course.courseDepartment,
						courseAssignmentId: element.courseAssignment.id,
						courseEnrollmentId: element.id,
						tasks: {
							total: 0,
							completed: element.courseTaskProgresses.length
						}
					};

					element.courseAssignment.course.courseSyllabus.courseModules.forEach((element) => {
						course.tasks.total += element.courseTasks.length;
					});

					updatedRes.push(course);
				});

				res.send(updatedRes);
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				console.log(err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Classes."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.listAssigned = (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);
		courseAssignments
			.findAll({
				where: { clientId, isActive: "Y" },
				include: [
					{
						model: Courses,
						where: { isActive: "Y", status: "P" },
						attributes: ["title", "code", "level", "language", "level"]
					}
				],
				attributes: ["id"]
			})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "Clients assigned courses list has been retrived", data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			about: Joi.string().required(),
			code: Joi.string().max(255).required(),
			level: Joi.string().required(),
			language: Joi.string().required(),
			status: Joi.string().optional(),
			objectives: Joi.any().optional(),
			classId: Joi.string().required(),
			courseDepartmentId: Joi.string().required(),
			instructorName: Joi.string().required(),
			instructorAbout: Joi.string().required(),
			image: Joi.any().optional(),
			approximateTime: Joi.string().required(),
			passingThreshold: Joi.string().optional()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseObj = {
				title: req.body.title.trim(),
				about: req.body.about,
				code: req.body.code,
				level: req.body.level,
				language: req.body.language,
				status: req.body.status,
				classId: crypto.decrypt(req.body.classId),
				courseDepartmentId: crypto.decrypt(req.body.courseDepartmentId),
				approximateTime: req.body.approximateTime,
				passingThreshold: req.body.passingThreshold ? req.body.passingThreshold : null
			};

			const alreadyExist = await Courses.findOne({
				where: {
					title: courseObj.title.trim(),
					isActive: "Y"
				},
				attributes: ["id"]
			});
			if (alreadyExist) {
				res.status(401).send({
					title: "Already exist.",
					message: "Course title already exist."
				});
			} else {
				let transaction = await sequelize.transaction();

				Courses.create(courseObj, { transaction })
					.then(async (result) => {
						const courseId = result.id;

						var courseObjectivesArr = req.body.objectives;
						if (courseObjectivesArr) {
							const objectives = [];
							courseObjectivesArr.forEach((objective) => {
								objectives.push({
									description: objective,
									courseId
								});
							});
							if (objectives.length > 0) await courseObjectives.bulkCreate(objectives, { transaction });
						}

						var syllabus = {
							title: "Table of Content",
							courseId: courseId
						};
						await courseSyllabus.create(syllabus, { transaction });

						var instructorObj = {
							name: req.body.instructorName,
							about: req.body.instructorAbout,
							courseId: courseId
						};
						if (req.file && req.file.filename) {
							instructorObj.imageUrl = "uploads/instructors/" + req.file.filename;
						}
						await courseInstructor.create(instructorObj, { transaction });

						await transaction.commit();
						encryptHelper(result);
						res.status(200).send({
							message: "Course created successfully.",
							data: result
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
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred.",
			err
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
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userId = crypto.decrypt(req.userId);
			const clientId = req.clientId ? crypto.decrypt(req.clientId) : null;
			Courses.findOne({
				where: { id: crypto.decrypt(req.body.courseId), isActive: "Y" },
				include: [
					{
						model: courseDepartment,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "title"]
					},
					{
						model: Classes,
						where: { isActive: "Y" },
						include: [
							{
								model: learningPaths,
								where: { isActive: "Y" },
								attributes: ["id", "title"]
							}
						],
						attributes: ["id", "title"]
					},
					{
						model: courseObjectives,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "description"]
					},
					{
						model: courseInstructor,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "name", "about", "imageUrl"]
					},
					{
						model: courseSyllabus,
						where: { isActive: "Y" },
						attributes: ["id", "title"]
					},
					{
						model: courseAssignments,
						where: { clientId, isActive: "Y" },
						required: false,
						include: [
							{
								model: CourseEnrollments,
								where: { isActive: "Y" },
								include: [
									{
										model: CourseEnrollmentUsers,
										where: { userId, isActive: "Y" },
										required: false,
										attributes: ["id", "progress"]
									}
								],
								required: false,
								attributes: ["id"]
							}
						],
						attributes: ["id"]
					}
				],
				attributes: { exclude: ["isActive", "createdAt", "updatedAt", "classId", "courseDepartmentId"] }
			})
				.then((data) => {
					encryptHelper(data);
					res.send(data);
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred while retrieving Classes."
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

exports.detailEnrollment = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			enrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userId = crypto.decrypt(req.userId);
			const clientId = req.clientId ? crypto.decrypt(req.clientId) : null;
			const enrollmentId = crypto.decrypt(req.body.enrollmentId);

			console.log(enrollmentId, userId, clientId);
			const enrollmentDetails = await CourseEnrollmentUsers.findOne({
				where: { userId, isActive: "Y" },
				include: [
					{
						model: CourseEnrollments,
						where: { id: enrollmentId, isActive: "Y" },
						include: [
							{
								model: courseAssignments,
								where: { clientId, isActive: "Y" },
								attributes: ["id", "courseId"]
							}
						],
						attributes: ["id"]
					}
				],
				attributes: ["id", "progress"]
			});

			const courseId = enrollmentDetails?.courseEnrollment?.courseAssignment?.courseId;
			// console.log("enrollmentDetails", enrollmentDetails);
			console.log("courseId", courseId);
			const courseDetails = await Courses.findOne({
				where: { id: courseId, isActive: "Y" },
				include: [
					{
						model: courseDepartment,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "title"]
					},
					{
						model: Classes,
						where: { isActive: "Y" },
						include: [
							{
								model: learningPaths,
								where: { isActive: "Y" },
								attributes: ["id", "title"]
							}
						],
						attributes: ["id", "title"]
					},
					{
						model: courseObjectives,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "description"]
					},
					{
						model: courseInstructor,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "name", "about", "imageUrl"]
					},
					{
						model: courseSyllabus,
						where: { isActive: "Y" },
						attributes: ["id", "title"]
					}
				],
				attributes: { exclude: ["isActive", "createdAt", "updatedAt", "classId", "courseDepartmentId"] }
			});

			encryptHelper(enrollmentDetails);
			encryptHelper(courseDetails);

			res.send({
				message: "Details retrieved",
				data: {
					assignment: {
						id: enrollmentDetails?.courseEnrollment?.courseAssignment?.id
					},
					enrollment: {
						id: crypto.encrypt(enrollmentId),
						progress: enrollmentDetails.progress
					},
					courseId: crypto.encrypt(courseId),
					course: courseDetails
				}
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
			courseId: Joi.string().max(255).required(),
			title: Joi.string().max(255).required(),
			about: Joi.string().required(),
			code: Joi.string().required(),
			level: Joi.string().required(),
			language: Joi.string().required(),
			status: Joi.string().required(),
			courseDepartmentId: Joi.string().required(),
			approximateTime: Joi.string().required(),
			passingThreshold: Joi.string().required()
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

			const courseObject = {
				title: req.body.title.trim(),
				about: req.body.about,
				code: req.body.code,
				level: req.body.level,
				language: req.body.language,
				status: req.body.status,
				courseDepartmentId: crypto.decrypt(req.body.courseDepartmentId),
				approximateTime: req.body.approximateTime,
				passingThreshold: req.body.passingThreshold ? req.body.passingThreshold : null
			};
			Courses.update(courseObject, { where: { id: courseId, isActive: "Y" } })
				.then((num) => {
					if (num == 1) {
						res.send({
							message: "Course was updated successfully."
						});
					} else {
						res.send({
							message: `Cannot update Course. Maybe Course was not found or req.body is empty!`
						});
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Error updating Class"
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

exports.delete = (req, res) => {
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

			Courses.update({ isActive: "N" }, { where: { id: courseId } })
				.then(async (num) => {
					if (num == 1) {
						res.send({
							message: "Course has been deleted successfully."
						});
					} else {
						res.send({
							message: `Cannot delete Course. Maybe Course not found!`
						});
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Error deleting Course"
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

exports.reset = async (req, res) => {
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
			const clientId = crypto.decrypt(req.clientId);
			const courseEnrollmentId = crypto.decrypt(req.body.courseEnrollmentId);

			const updateProgress = await CourseEnrollmentUsers.update(
				{ progress: "0" },
				{
					where: { isActive: "Y", courseEnrollmentId: courseEnrollmentId },
					include: [
						{
							model: CourseEnrollments,
							where: { isActive: "Y" },
							include: [
								{
									model: courseAssignments,
									where: { isActive: "Y", clientId: clientId }
								}
							]
						}
					]
				}
			);

			res.send({ message: "The Courses are reseted", data: updateProgress });
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
