const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");

const Users = db.users;
const Roles = db.roles;
const Courses = db.courses;
const Enrollments=db.courseEnrollments
const UserProfile=db.userProfiles
const Op = db.Sequelize.Op;
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			firstName: Joi.string().required(),
			lastName: Joi.string().required(),
			email: Joi.string().required(),
			role: Joi.string().required(),
			password: Joi.string().required(),
			userId: Joi.string().required(),
			clientId: Joi.string().required()
		});
		// console.log(req.body);
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			}); 
		} else {
			const user = await Users.findOne({ where: { email: req.body.email?.trim(), isActive: "Y" } });

			if (user) {
				res.status(401).send({
					mesage: "Email already registered."
				});
			} else {
				// const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*+-";
				// var shuffled = chars
				// 	.split("")
				// 	.sort(function() {
				// 		return 0.5 - Math.random();
				// 	})
				// 	.join("");
				// var password = "";
				// for (var i = 0; i < 20; i++) {
				// 	password += shuffled[Math.floor(Math.random() * shuffled.length)];
				// }

				const userObj = {
					firstName: req.body.firstName?.trim(),
					lastName: req.body.lastName?.trim(),
					email: req.body.email,
					createdBy: crypto.decrypt(req.userId),
					roleId: crypto.decrypt(req.body.role),
					password: req.body.password,
					clientId:crypto.decrypt(req.body.clientId)
				};

				let transaction = await sequelize.transaction();
				Users.create(userObj, { transaction })
					.then(async (user) => {
						
						UserProfile.create({userId:user.id},{ transaction })
						.then(async(profile)=>{
							// emails.addUser(userObj);
							await transaction.commit();
	
							res.status(200).send({
						
								message: "User created successfully."
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


//Retrive all Users for client
exports.findAllClientUsers = (req, res) => {
	try {
		Users.findAll({
			where: {
				clientId:req.body.clientId,
				isActive: "Y"
			},
			include: [
				
				{
					model: Enrollments,
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
				// console.log(data.teaches);

				encryptHelper(data);
				res.send(data);
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Users."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
// Retrieve all User.
exports.findAllUsers = (req, res) => {
	try {
		console.log("hi")
		Users.findAll({
			where: {
				isActive: "Y"
			},
			include: [
				{
					model: Roles,
					attributes: { exclude: ["createdAt", "updatedAt", "isActive"] }
				},
				{
					model: UserProfile,
					where: { isActive: "Y" },
					required: false,
					attributes: ["userId", "isActive"]
				}
			],
			attributes: { exclude: ["createdAt", "updatedAt","password"] }
		})
			.then((data) => {
				// console.log(data)
				// encryptHelper(data);
				res.send({message:"All users are retrived" ,data:data});
			})
			.catch((err) => {
				// emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Users."
				});
			});
	} catch (err) {
		// emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};


// Retrieve all Users.
exports.findUserById = (req, res) => {
	try {
		Users.findOne({
			where: { id: crypto.decrypt(req.params.userId), isActive: "Y" },
			attributes: { exclude: ["isActive"] }
		})
			.then((data) => {
				encryptHelper(data);
				res.send(data);
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving user."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};


// Update a User by the id in the request
exports.updateProfile = (req, res) => {
	try {
		const joiSchema = Joi.object({
			firstName: Joi.string().required(),
			lastName: Joi.string().required(),
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
			
			var user = {
				firstName: req.body.firstName?.trim(),
				lastName: req.body.lastName?.trim()
			};
			
			Users.update(user, {
				where: { id: userId, isActive: "Y" }
			})
				.then((num) => {
					if (num == 1) {
						Users.findOne({
							where: { id: userId },
							include: [
								{
									model: Roles,
									attributes: ["title"]
								}
							],
							attributes: { exclude: ["password"] }
						}).then((user) => {
							encryptHelper(user);
							res.send({ message: "User profile updated successfully.", user });
						});
					} else {
						res.send({
							message: `Cannot update User. Maybe User was not found or req.body is empty!`
						});
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Error updating User"
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

exports.resetPassword = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			oldPassword: Joi.string().required(),
			password: Joi.string()
			.min(8)
				.max(16)
				.required(),
				password_confirmation: Joi.any()
				.valid(Joi.ref("password"))
				.required()
				.label("Password and confirm password doesn't match.")
			});
			const { error, value } = joiSchema.validate(req.body);
			
			if (error) {
				emails.errorEmail(req, error);
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const id = crypto.decrypt(req.userId);
			const oldPassword = req.body.oldPassword;
			const newPassword = req.body.password;
			
			const user = await Users.findOne({ where: { id: id, isActive: "Y", password: oldPassword } });
			
			if (user) {
				Users.update({ password: newPassword }, { where: { id: id, isActive: "Y", password: oldPassword } })
					.then((num) => {
						if (num == 1) {
							res.send({
								message: `User password updated successfully!`
							});
						} else {
							res.send({
								message: `Cannot update User password. Maybe User was not found or req body is empty.`
							});
						}
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: "Error updating User password"
						});
					});
			} else {
				res.status(406).send({
					message: `Old password does not match.`
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

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
	try {
		const userId = crypto.decrypt(req.params.userId);
		
		Users.update(
			{ isActive: "N" },
			{
				where: { id: userId }
			}
			)
			.then(async (num) => {
				if (num == 1) {
					res.send({
						message: "User was deleted successfully."
					});
				} else {
					res.send({
						message: `Cannot delete User. Maybe User was not found!`
					});
				}
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: "Error deleting User"
				});
			});
		} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};



// Update a User by the id in the request

exports.update = (req, res) => {
	try {
		const joiSchema = Joi.object({
			role: Joi.string().required(),
			courses: Joi.array().items(Joi.string().optional())
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userId = crypto.decrypt(req.params.userId);

			console.log(userId, req.body);
			// console.log(req.body, crypto.decrypt(req.body.role));
			Users.update(
				{
					roleId: crypto.decrypt(req.body.role?.trim()),
					updatedBy: crypto.decrypt(req.userId)
				},
				{
					where: { id: userId, isActive: "Y" }
				}
			)
				.then(async (num) => {
					var flag = false;
					if (crypto.decrypt(req.body.role?.trim()) == 3) {
						const courses = await Teaches.findAll({
							where: { userId: userId, isActive: "Y" }
						});
						var coursesList = [];
						await courses.forEach((course) => {
							coursesList.push(course.courseId);
						});

						var addNew = [];

						req.body.courses.forEach((course) => {
							var courseId = crypto.decrypt(course);
							var i = -1;
							coursesList.forEach((element, index) => {
								if (element == courseId) {
									i = index;
								}
							});

							if (i == -1) {
								addNew.push({
									userId: userId,
									courseId: courseId
								});
							}
							coursesList.splice(i, 1);
						});

						if (coursesList.length != 0) {
							Teaches.update(
								{ isActive: "N" },
								{
									where: { courseId: coursesList }
								}
							);
							flag = true;
						}
						if (addNew.length) {
							const res = await Teaches.bulkCreate(addNew);
							flag = true;
						}
					} else {
						const isTeacher = await Teaches.count({ where: { isActive: "Y", userId: userId } });
						if (isTeacher) {
							Teaches.update({ isActive: "N" }, { where: { userId: userId } });
							flag = true;
						}
					}

					if (num == 1 || flag) {
						res.send({
							message: "User was updated successfully."
						});
					} else {
						res.send({
							message: `Cannot update User. Maybe User was not found or req.body is empty!`
						});
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: "Error updating User"
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



	// exports.findAllStudentsForAssessment = async (req, res) => {
			// 	try {
		// 		var quizId = crypto.decrypt(req.params.quizId);
		
		// 		var alreadyAssignedStudents = await Users.findAll({
		// 			where: { isActive: "Y" },
		// 			include: [
			// 				{
		// 					model: AssignTo,
		// 					where: { quizId: quizId },
		// 					attributes: ["userId"]
		// 				}
		// 			],
		// 			attributes: ["id", "firstName", "lastName", "email"]
		// 		});
		
		// 		encryptHelper(alreadyAssignedStudents);
		// 		var assignedStudentsIds = alreadyAssignedStudents.map((e) => {
		// 			return e.id;
		// 		});
		
		// 		Users.findAll({
		// 			where: { isActive: "Y" },
		// 			include: [
			// 				{
		// 					model: Roles,
		// 					where: { title: "Student" },
		// 					attributes: { exclude: ["createdAt", "updatedAt", "isActive"] }
		// 				}
		// 			],
		// 			attributes: { exclude: ["createdAt", "updatedAt", "password", "isActive"] }
		// 		})
		// 			.then(async (data) => {
		// 				encryptHelper(data);
		
		// 				var list = [];
		// 				await data.forEach((user) => {
		// 					if (assignedStudentsIds.indexOf(user.id) == -1) {
		// 						list.push(user);
		// 					}
		// 				});
		// 				res.send({
			// 					notAssigned: list,
		// 					assigned: alreadyAssignedStudents
		// 				});
		// 			})
		// 			.catch((err) => {
		// 				emails.errorEmail(req, err);
		// 				res.status(500).send({
		// 					message: err.message || "Some error occurred while retrieving Users."
		// 				});
		// 			});
		// 	} catch (err) {
		// 		emails.errorEmail(req, err);
		
		// 		res.status(500).send({
		// 			message: err.message || "Some error occurred."
		// 		});
		// 	}
		// };
		
		// // Retrieve all Users Enrolled in Course.
		// exports.findAllUsersEnrolledInCourse = (req, res) => {
		// 	try {
		// 		Users.findAll({
		// 			where: { isActive: "Y" },
		// 			include: [
		// 				{
		// 					model: Roles,
		// 					attributes: [],
		// 					where: { title: "Student" }
		// 				}
		// 			],
		// 			attributes: ["id", "firstName", "lastName", "email"]
		// 		})
		// 			.then((data) => {
		// 				encryptHelper(data);
		// 				res.send(data);
		// 			})
		// 			.catch((err) => {
		// 				emails.errorEmail(req, err);
		// 				res.status(500).send({
		// 					message: err.message || "Some error occurred while retrieving Users."
		// 				});
		// 			});
		// 	} catch (err) {
		// 		emails.errorEmail(req, err);
		
		// 		res.status(500).send({
		// 			message: err.message || "Some error occurred."
		// 		});
		// 	}
		// };
