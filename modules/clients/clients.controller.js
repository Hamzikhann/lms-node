const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const Joi = require("@hapi/joi");
const CourseAssignments = db.courseAssignments;
const Client = db.clients;
const Users = db.users;
const CourseEnrollments = db.courseEnrollments;
const Course = db.courses;
exports.list = async (req, res) => {
	try {
		Client.findAll({
			where: { isActive: "Y" },
			attributes: { exclude: ["createdAt", "updatedAt", "isActive"] }
		})
			.then((data) => {
				encryptHelper(data);
				res.send({
					message: "Clients list has been retrieved",
					data
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving clients."
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
			name: Joi.string().required(),
			website: Joi.string().required(),
			logo: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const client = await Client.findOne({ where: { name: req.body.name, isActive: "Y" } });

			if (client) {
				res.status(401).send({
					mesage: "Client with this name already registered."
				});
			} else {
				const clientObj = {
					name: req.body.name,
					website: req.body.website,
					logoURL: req.body.logo
				};

				Client.create(clientObj)
					.then(async (client) => {
						encryptHelper(client);
						res.status(200).send({
							message: "Client created successfully.",
							data: client
						});
					})
					.catch(async (err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred while creating the client."
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
exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			clientId: Joi.string().optional().allow(null).allow(""),
			name: Joi.string().required(),
			website: Joi.string().required(),
			logo: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const clientId = req.role == "Administrator" ? crypto.decrypt(req.body.clientId) : crypto.decrypt(req.clientId);
			const clientObj = {
				name: req.body.name,
				website: req.body.website,
				logoURL: req.body.logo
			};

			const updatedClient = Client.update(clientObj, { where: { id: clientId, isActive: "Y" } });
			if (updatedClient == 1) {
				res.status(200).send({
					message: "Client updated successfully."
				});
			} else {
				res.status(200).send({
					message: "Unable to update client info, maybe client doesn't exists"
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
exports.updateImage = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			clientId: Joi.string().optional().allow(null).allow(""),
			image: Joi.any()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const clientId = req.role == "Administrator" ? crypto.decrypt(req.body.clientId) : crypto.decrypt(req.clientId);
			const logoURL = "uploads/clients/" + req.file.filename;

			const updateClient = await Client.update({ logoURL }, { where: { id: clientId, isActive: "Y" } });
			if (updateClient == 1) {
				res.status(200).send({ message: "Client logo Updated" });
			} else {
				res.send({
					message: "Failed to update client logo."
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
			clientId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const clientId = crypto.decrypt(req.body.clientId);
			const clientObj = {
				isActive: "N"
			};

			const updatedClient = Client.update(clientObj, { where: { id: clientId, isActive: "Y" } });
			if (updatedClient == 1) {
				res.status(200).send({
					message: "Client deleted successfully."
				});
			} else {
				res.status(200).send({
					message: "Unable to delete client info, maybe client doesn't exists"
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
// courseid courseenroolmenttyoeDi user id

exports.enrollment = async (req, res) => {
	try {
		// console.log(req.clientId);

		const courseId = crypto.decrypt(req.body.courseId);
		const courseEnrollmeentTypeId = crypto.decrypt(req.body.courseEnrollmentTypeId);
		const clientId = crypto.decrypt(req.clientId);
		if (courseEnrollmeentTypeId == 1) {
			let enrollmentObj = [];

			const users = await Users.findAll({ where: { clientId: clientId, isActive: "Y" } });
			const courseAssignments = await CourseAssignments.findOne({ where: { courseId: courseId }, isActive: "Y" });
			console.log(courseAssignments);
			users.forEach((e) => {
				let obj = {
					courseEnrollmeentTypeId: courseEnrollmeentTypeId,
					courseAssignmentId: courseAssignments.id,
					userId: e.id,
					userDepartmentId: e.userDepartmentId
				};
				enrollmentObj.push(obj);
			});
			console.log(enrollmentObj);
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
