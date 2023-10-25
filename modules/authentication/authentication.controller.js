const db = require("../../models");
const jwt = require("../../utils/jwt");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const Joi = require("@hapi/joi");
const Users = db.users;
const Roles = db.roles;

const Op = db.Sequelize.Op;

exports.login = async (req, res) => {
	try {
		const roleIdList = [];
		roleIdList.push(1, 2, 3); // For Postman
		// if (req.headers.origin.indexOf("practokit.oxibit") != -1) {
		// 	roleIdList.push(4); // Student
		// } else if (req.headers.origin.indexOf("practokit-admin.oxibit") != -1) {
		// 	roleIdList.push(1, 2, 3); // Admin, Editor, Teacher
		// } else if (req.headers.origin.indexOf("localhost") != -1) {
		// 	// roleIdList.push(1, 2, 3) // Admin, Editor, Teacher
		// 	roleIdList.push(4); // Student
		// } else {
		// 	roleIdList.push(-1);
		// }
		// console.log(req.body);
		console.log(req.body.email);
		const userExist = await Users.findOne({
			where: {
				email: req.body.email,
				isActive: {
					[Op.not]: "N"
				},
				roleId: roleIdList
			}
		});
		// console.log(userExist);
		// crypto.encrypt(req.body.password)
		if (userExist && userExist.isActive == "Y") {
			const user = await Users.findOne({
				where: {
					email: req.body.email.trim(),
					password: req.body.password,
					isActive: "Y",
					roleId: roleIdList
				},
				include: [
					{
						model: Roles,
						attributes: ["title"]
					}
				],
				attributes: { exclude: ["password"] }
			});
			if (user) {
				encryptHelper(user);

				const token = jwt.signToken({
					userId: user.id,
					roleId: user.roleId,
					clientId: user.clientId,
					role: user.role.title
				});
				res.status(200).send({ token, user });
			} else {
				res.status(403).send({ message: "Incorrect Logins" });
			}
		} else {
			res.status(405).send({
				title: "Incorrect Email.",
				message: "Email does not exist in our system, Please verify you have entered correct email."
			});
		}
	} catch (err) {
		// emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.forgotPassword = async (req, res) => {
	try {
		const roleIdList = [];
		if (req.headers.origin.indexOf("assessment-tool-student.mathecad") != -1) {
			roleIdList.push(4); // Student
		} else if (req.headers.origin.indexOf("assessment-tool.mathecad") != -1) {
			roleIdList.push(1, 2, 3); // Admin, Editor, Teacher
		} else if (req.headers.origin.indexOf("localhost") != -1) {
			roleIdList.push(1, 2, 3); // Admin, Editor, Teacher
			// roleIdList.push(4) // Student
		} else {
			roleIdList.push(-1);
		}

		var email = req.body.email.trim();

		const user = await Users.findOne({
			where: {
				email: email,
				isActive: "Y",
				roleId: roleIdList
			}
		});
		if (user) {
			emails.forgotPassword(user);
			res.status(200).send({ message: "Email send to user." });
		} else {
			res.status(405).send({
				title: "Incorrect Email.",
				message: "Email does not exist in our system, Please verify you have entered correct email."
			});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while reset password."
		});
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			password: Joi.string()
				.min(8)
				.max(16)
				.required(),
			confirmPassword: Joi.any()
				.valid(Joi.ref("password"))
				.required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			var email = req.email;
			const roleIdList = [];
			if (req.headers.origin.indexOf("assessment-tool-student.mathecad") != -1) {
				roleIdList.push(4); // Student
			} else if (req.headers.origin.indexOf("assessment-tool.mathecad") != -1) {
				roleIdList.push(1, 2, 3); // Admin, Editor, Teacher
			} else if (req.headers.origin.indexOf("localhost") != -1) {
				roleIdList.push(1, 2, 3); // Admin, Editor, Teacher
				// roleIdList.push(4) // Student
			} else {
				roleIdList.push(-1);
			}

			const user = await Users.findOne({
				where: {
					email: email,
					isActive: "Y",
					roleId: roleIdList
				}
			});

			if (user) {
				var password = req.body.password;

				Users.update({ password: crypto.encrypt(password) }, { where: { id: user.id } })
					.then((result) => {
						res.send({
							message: "User password reset successfully."
						});
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: "Error while reset User password"
						});
					});
			} else {
				res.status(405).send({
					title: "Incorrect Email.",
					message: "Email does not exist in our system, Please verify you have entered correct email."
				});
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while reset password."
		});
	}
};
