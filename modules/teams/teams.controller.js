const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const Teams = db.teams;
const Client = db.clients;

exports.create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			clientId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const teamObj = {
				title: req.body.title,
				clientId: crypto.decrypt(req.body.clientId)
			};

			Teams.create(teamObj)
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ messgae: "Team of the client is created", data: response });
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
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};

exports.list = (req, res) => {
	try {
		Teams.findAll({ where: { isActive: "Y" } })
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All temas are retrived", data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while creating the Quiz."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};

exports.detail = (req, res) => {
	try {
		const joiSchema = Joi.object({
			teamId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			Teams.findOne({
				where: { id: crypto.decrypt(req.body.teamId), isActive: "Y" },
				include: [
					{
						model: Client,
						where: { isActive: "Y" }
					}
				]
			})
				.then((response) => {
					encryptHelper(response);
					res.send({ messgae: "The detail of team is retrived", data: response });
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
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};

exports.update = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			teamId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const teamObj = {
				title: req.body.title
			};
			Teams.update(teamObj, { where: { id: crypto.decrypt(req.body.teamId) } })
				.then((response) => {
					res.send({ message: "The team is updated", data: response });
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
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};

exports.delete = (req, res) => {
	try {
		const joiSchema = Joi.object({
			teamId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const teamObj = { isActive: "N" };
			Teams.update(teamObj, { where: { id: crypto.decrypt(req.body.teamId) } })
				.then((response) => {
					res.send({ message: "This team is deleted", data: response });
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
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};
