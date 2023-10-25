const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const Classes = db.classes;
const Courses = db.courses;

const Joi = require("@hapi/joi");

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const classObj = {
				title: req.body.title.trim(),
                learningPathId:req.body.leaningPathId
			};

			const alreadyExist = await Classes.findOne({
				where: {
					title: classObj.title
				},
				attributes: ["id"]
			});
			if (alreadyExist) {
				res.status(405).send({
					title: "Already exist.",
					message: "Class is already exist."
				});
			} else {
				Classes.create(classObj)
					.then(async (result) => {
						res.status(200).send({
							message: "Class created successfully."
						});
					})
					.catch(async (err) => {
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

// Retrieve all Classes.
exports.findAllClasses = (req, res) => {
	try {
		Classes.findAll({
			where: { isActive: "Y" },

            include: [
				
				{
					model: Courses,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							required: false,
							where: { isActive: "Y" },
							attributes: ["title"]
						}
					],
					required: false,
					attributes: ["courseId", "isActive"]
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


// Retrieve all Classes with courses.
exports.findClasseswithCourses = (req, res) => {
	try {
		Classes.findAll({
			where: { isActive: "Y" },
			include: {
				model: Courses,
				where: { isActive: "Y" },
				attributes: ["id", "title"]
			},
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



// Retrieve Class by Id.
exports.findClassById = (req, res) => {
	try {
		Classes.findOne({
			where: { id: crypto.decrypt(req.params.classId), isActive: "Y" },
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
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

// Update a Class by the id in the request
exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const classId = crypto.decrypt(req.params.classId);
			const userId = crypto.decrypt(req.userId);

			const alreadyExist = await Classes.findOne({
				where: {
					title: req.body.title.trim()
				},
				attributes: ["id"]
			});
			if (alreadyExist) {
				res.status(405).send({
					title: "Already exist.",
					message: "Class is already exist with same name."
				});
			} else {
				Classes.update(
					{ title: req.body.title.trim(), updatedBy: crypto.decrypt(req.userId) },
					{
						where: { id: classId, isActive: "Y", createdBy: userId }
					}
				)
					.then((num) => {
						if (num == 1) {
							res.send({
								message: "Class was updated successfully."
							});
						} else {
							res.send({
								message: `Cannot update Class. Maybe Class was not found or req.body is empty!`
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

// Delete a Class with the specified id in the request
exports.delete = (req, res) => {
	try {
		const classId = crypto.decrypt(req.params.classId);
		const userId = crypto.decrypt(req.userId);

		Classes.update(
			{ isActive: "N" },
			{
				where: { id: classId, createdBy: userId }
			}
		)
			.then(async (num) => {
				if (num == 1) {
					res.send({
						message: "Class was deleted successfully."
					});
				} else {
					res.send({
						message: `Cannot delete Class. Maybe Class was not found!`
					});
				}
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: "Error deleting Class"
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