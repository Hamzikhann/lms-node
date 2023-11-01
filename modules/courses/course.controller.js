const Joi = require("@hapi/joi");
const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const { sequelize } = require("../../models");

const Classes = db.classes;
const Courses = db.courses;
const learningPaths = db.learningPaths;
const courseBooks = db.courseBooks;
const courseDepartment = db.courseDepartments;
const courseAssignments = db.courseAssignments;
const CourseEnrollments = db.courseEnrollments;
const courseFaqs = db.courseFaqs;
const courseInstructor = db.courseInstructors;
const courseObjectives = db.courseObjectives;
const courseUsefulLinks = db.courseUsefulLinks;
const courseSyllabus = db.courseSyllabus;
const courseModule = db.courseModules;
const courseTasks = db.courseTasks;
const courseTaskTypes = db.courseTaskTypes;
const User = db.users;

exports.list = (req, res) => {
	try {
		Courses.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: courseDepartment,
					where: { isActive: "Y" },
					required: false,
					attributes: ["id", "title", "isActive"]
				},
				{
					model: courseInstructor,
					where: { isActive: "Y" },
					required: false,
					attributes: ["id", "name", "isActive"]
				}
			],
			attributes: { exclude: ["isActive", "createdAt", "updatedAt", "classId", "courseDepartmentId"] }
		})
			.then((data) => {
				console.log(data);
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

		Courses.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: courseDepartment,
					where: { isActive: "Y" },
					required: false,
					attributes: ["id", "title", "isActive"]
				},
				{
					model: courseInstructor,
					where: { isActive: "Y" },
					required: false,
					attributes: ["id", "name", "isActive"]
				},
				{
					model: courseAssignments,
					where: { clientId, isActive: "Y" },
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

		// Get all courses for the logged in user enrollment
		// Get all courses for the logged in user department enrollment
		// Get all courses for the logged in user client
		console.log(req.clientId);

		CourseEnrollments.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: courseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y" },
							include: [
								{
									model: courseDepartment,
									where: { isActive: "Y" },
									required: false,
									attributes: ["id", "title", "isActive"]
								},
								{
									model: courseInstructor,
									where: { isActive: "Y" },
									required: false,
									attributes: ["id", "name", "isActive"]
								}
							],
							attributes: { exclude: ["isActive", "createdAt", "updatedAt", "classId", "courseDepartmentId"] }
						}
					],
					attributes: ["id", "dateFrom", "dateTo"]
				}
			],
			attributes: ["id"]
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

		// Courses.findAll({
		// 	where: { isActive: "Y" },
		// 	include: [
		// 		{
		// 			model: courseDepartment,
		// 			where: { isActive: "Y" },
		// 			required: false,
		// 			attributes: ["id", "title", "isActive"]
		// 		},
		// 		{
		// 			model: courseInstructor,
		// 			where: { isActive: "Y" },
		// 			required: false,
		// 			attributes: ["id", "name", "isActive"]
		// 		},
		// 		{
		// 			model: courseAssignments,
		// 			where: { clientId, isActive: "Y" },
		// 			// include: [
		// 			// 	{
		// 			// 		model: CourseEnrollments,
		// 			// 		where: { isActive: "Y" }
		// 			// 	}
		// 			// ],
		// 			attributes: ["id"]
		// 		}
		// 	],
		// 	attributes: { exclude: ["isActive", "createdAt", "updatedAt", "classId", "courseDepartmentId"] }
		// })
		// 	.then((data) => {
		// 		encryptHelper(data);
		// 		res.send(data);
		// 	})
		// 	.catch((err) => {
		// 		emails.errorEmail(req, err);
		// 		res.status(500).send({
		// 			message: err.message || "Some error occurred while retrieving Classes."
		// 		});
		// 	});
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
			title: Joi.string().required(),
			about: Joi.string().required(),
			code: Joi.string().required(),
			level: Joi.string().required(),
			language: Joi.string().required(),
			status: Joi.string().required(),
			objectives: Joi.string().optional().allow(null).allow([]),
			classId: Joi.string().required(),
			courseDepartmentId: Joi.string().required(),
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

			const courseObj = {
				title: req.body.title.trim(),
				about: req.body.about,
				code: req.body.code,
				level: req.body.level,
				language: req.body.language,
				status: req.body.status,
				classId: crypto.decrypt(req.body.classId),
				courseDepartmentId: crypto.decrypt(req.body.courseDepartmentId)
			};

			const alreadyExist = await Courses.findOne({
				where: {
					title: courseObj.title.trim()
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

						const courseObjectivesArr = req.body.objectives;
						courseObjectivesArr.forEach((objective) => {
							objective.courseId = courseId;
						});
						await courseObjectives.bulkInsert(courseObjectivesArr, { transaction });

						const syllabus = {
							title: "Table of Content",
							courseId: courseId
						};
						await courseSyllabus.create(syllabus, { transaction });

						const instructorObj = {
							name: req.body.name,
							about: req.body.about,
							imageUrl: image,
							courseId: courseId
						};

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

exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required(),
			title: Joi.string().required(),
			about: Joi.string().required(),
			code: Joi.string().required(),
			level: Joi.string().required(),
			language: Joi.string().required(),
			status: Joi.string().required(),
			courseDepartmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseId = crypto.decrypt(req.body.courseId);

			const alreadyExist = await Classes.findOne({
				where: {
					title: req.body.title.trim()
				},
				attributes: ["id"]
			});
			if (alreadyExist) {
				res.status(401).send({
					title: "Already exist.",
					message: "Class is already exist with same name."
				});
			} else {
				const courseObject = {
					title: req.body.title.trim(),
					about: req.body.about,
					code: req.body.code,
					level: req.body.level,
					language: req.body.language,
					status: req.body.status,
					courseDepartmentId: crypto.decrypt(req.body.courseDepartmentId)
				};
				Classes.update(courseObject, { where: { id: courseId, isActive: "Y" } })
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

exports.enrollment = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			required: Joi.string().required(),
			assignmentId: Joi.string().required(),
			courseEnrollmentTypeId: Joi.string().required(),
			userDepartmentId: Joi.string().optional().allow(null).allow(""),
			userId: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.assignmentId);
			const courseEnrollmentTypeId = crypto.decrypt(req.body.courseEnrollmentTypeId);
			const userDepartmentId = req.body.userDepartmentId ? crypto.decrypt(req.body.userDepartmentId) : null;
			const userId = req.body.userId ? crypto.decrypt(req.body.userId) : null;

			const enrollmentExists = await CourseEnrollments.findOne({
				where: {
					courseAssignmentId: courseAssignmentId,
					courseEnrollmentTypeId,
					isActive: "Y"
				}
			});
			console.log(enrollmentExists);
			if (enrollmentExists && courseEnrollmentTypeId == 1) {
				res.status(401).send({
					message: "Unable to enroll course, it is already enrolled to all users.."
				});
			} else if (enrollmentExists && enrollmentExists.userDepartmentId == userDepartmentId) {
				res.status(401).send({
					message: "Unable to enroll course, it is already enrolled to this department."
				});
			} else if (enrollmentExists && enrollmentExists.userId == userId) {
				res.status(401).send({
					message: "Unable to enroll course, it is already enrolled to this user."
				});
			} else {
				const enrollmentObj = {
					required: req.body.required,
					courseEnrollmentTypeId,
					courseAssignmentId,
					userDepartmentId,
					userId
				};
				const response = await CourseEnrollments.create(enrollmentObj);
				res.send({
					message: "All users have been enrolled to this course already",
					data: response
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

// Retrieve all Classes with courses.
// exports.findClasseswithCoursesForTeacher = (req, res) => {
// 	try {
// 		Classes.findAll({
// 			where: { isActive: "Y" },
// 			include: {
// 				model: Courses,
// 				where: { isActive: "Y" },
// 				include: [{ model: Teaches, where: { isActive: "Y", userId: crypto.decrypt(req.userId) } }],
// 				attributes: ["id", "title"]
// 			},
// 			attributes: { exclude: ["createdAt", "updatedAt"] }
// 		})
// 			.then((data) => {
// 				encryptHelper(data);
// 				res.send(data);
// 			})
// 			.catch((err) => {
// 				emails.errorEmail(req, err);
// 				res.status(500).send({
// 					message: err.message || "Some error occurred while retrieving Classes."
// 				});
// 			});
// 	} catch (err) {
// 		emails.errorEmail(req, err);

// 		res.status(500).send({
// 			message: err.message || "Some error occurred."
// 		});
// 	}
// };
// Retrieve all Classes For Teacher.
// exports.findAllForTeacher = (req, res) => {
// 	try {
// 		// console.log(crypto.decrypt(req.userId));
// 		Classes.findAll({
// 			where: { isActive: "Y" },
// 			include: [
// 				{
// 					model: Courses,
// 					where: { isActive: "Y" },
// 					include: [{ model: Teaches, where: { isActive: "Y", userId: crypto.decrypt(req.userId) } }]
// 				}
// 			],
// 			attributes: { exclude: ["createdAt", "updatedAt"] }
// 		})
// 			.then((data) => {
// 				// console.log(data);
// 				encryptHelper(data);
// 				res.send(data);
// 			})
// 			.catch((err) => {
// 				emails.errorEmail(req, err);
// 				res.status(500).send({
// 					message: err.message || "Some error occurred while retrieving Classes."
// 				});
// 			});
// 	} catch (err) {
// 		emails.errorEmail(req, err);

// 		res.status(500).send({
// 			message: err.message || "Some error occurred."
// 		});
// 	}
// };
