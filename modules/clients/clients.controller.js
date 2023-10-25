const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const Joi = require("@hapi/joi");

const Client = db.clients;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			name: Joi.string().required(),
			website: Joi.string().required(),
			logoURL: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

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
exports.list = async (req, res) => {
	try {
		Client.findAll({
			where: { isActive: "Y" },
			attributes: { exclude: ["createdAt", "updatedAt", "isActive"] }
		})
			.then((data) => {
				encryptHelper(data);
				res.send({
					message: "Clients list retrieved",
					data
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving clients."
				});
			});
	} catch (err) {}
};
