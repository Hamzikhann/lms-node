const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const Joi = require("@hapi/joi");
const CourseAssignments = db.courseAssignments;
const Clients = db.clients;
const Users = db.users;
const CourseEnrollments = db.courseEnrollments;
const Courses = db.courses;

exports.list = async (req, res) => {
	try {
		Clients.findAll({
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
exports.listAssignments = (req, res) => {
	try {
		Clients.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y" },
							attributes: ["title", "code", "level"]
						}
					],
					attributes: ["id", "courseId"]
				}
			],
			attributes: ["id", "name", "logoURL"]
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({
					message: "Clients assigned courses list has been retrived",
					data: response
				});
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
			const client = await Clients.findOne({ where: { name: req.body.name, isActive: "Y" } });

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

				Clients.create(clientObj)
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

			const updatedClient = Clients.update(clientObj, { where: { id: clientId, isActive: "Y" } });
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

			const updateClient = await Clients.update({ logoURL }, { where: { id: clientId, isActive: "Y" } });
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

			const updatedClient = Clients.update(clientObj, { where: { id: clientId, isActive: "Y" } });
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
