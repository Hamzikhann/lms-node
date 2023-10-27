const Joi = require("@hapi/joi");
const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const { sequelize } = require("../../models");

const Classes = db.classes;
const Courses = db.courses;

const courseBooks = db.courseBooks;
const courseDepartment = db.courseDepartments;
const courseAssignments = db.courseAssignments;
const courseEnrollments = db.courseEnrollments;
const courseFaqs = db.courseFaqs;
const courseInstructor = db.courseInstructors;
const courseObjective = db.courseObjectives;
const courseUsefulLinks = db.courseUsefulLinks;
const courseSyllabus = db.courseSyllabus;
const courseModule = db.courseModules;
const courseTasks = db.courseTasks;
const courseTaskTypes = db.courseTaskTypes;

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
			attributes: { exclude: ["createdAt", "updatedAt"] }
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
					attributes: []
				}
			],
			attributes: { exclude: ["createdAt", "updatedAt"] }
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
					attributes: []
				}
			],
			attributes: { exclude: ["createdAt", "updatedAt"] }
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

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			about: Joi.string().required(),
			code: Joi.string().required(),
			level: Joi.string().required(),
			language: Joi.string().required(),
			classId: Joi.string().required(),
			courseDepartmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
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
					message: "Course is already exist."
				});
			} else {
				let transaction = await sequelize.transaction();

				Courses.create(courseObj, { transaction })
					.then(async (result) => {
						const syllabus = {
							title: "Table of Content",
							courseId: result.id
						};
						courseSyllabus
							.create(syllabus, { transaction })
							.then(async (response) => {
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
						model: courseObjective,
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
						model: courseBooks,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "title", "edition", "author", "publisher", "bookUrl"]
					},
					{
						model: courseFaqs,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "title", "description"]
					},
					{
						model: courseUsefulLinks,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "title", "description", "linkUrl"]
					},
					{
						model: courseSyllabus,
						where: { isActive: "Y" },
						include: [
							{
								model: courseModule,
								where: { isActive: "Y" },
								include: [
									{
										model: courseTasks,
										where: { isActive: "Y" },
										include: [
											{
												model: courseTaskTypes,
												where: { isActive: "Y" },
												required: false,
												attributes: ["id", "title"]
											}
										],
										required: false,
										attributes: ["id", "title", "description", "estimatedTime"]
									}
								],
								required: false,
								attributes: ["id", "title", "description"]
							}
						],
						required: false,
						attributes: ["id", "title"]
					}
				],
				attributes: { exclude: ["isActive"] }
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

exports.courseEnrollmeent = (req, res) => {
	try {
		const courseId = crypto.decrypt(req.body.courseId);
		const clientId = crypto.decrypt(req.body.clientId);

		let obj = {
			courseId: courseId,
			clientId: clientId,
			dateFrom: req.body.dateFrom,
			dateTo: req.body.dateTo
		};
		CourseAssignments.create(obj)
			.then((response) => {
				res.status(200).send({ message: "course is assigned to the clients" });
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
