const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const TeamUsers = db.teamUsers;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			// userId: Joi.string().required(),
			userIds: Joi.any().required(),
			teamId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			// const teamUserObj = {
			// 	name: req.body.name,
			// 	teamId: crypto.decrypt(req.body.teamId),
			// 	userId: crypto.decrypt(req.body.userId),
			// 	clientId: crypto.decrypt(req.body.clientId)
			// };

			// TeamUsers.create(teamUserObj)
			// 	.then((response) => {
			// 		encryptHelper(response);
			// 		res.status(200).send({ message: "team user is created", data: response });
			// 	})
			// 	.catch((err) => {
			// 		emails.errorEmail(req, err);
			// 		res.status(500).send({
			// 			message: err.message || "Some error occurred while creating the Quiz."
			// 		});
			// 	});

			const userIds = req.body.userIds;
			let teamUser = {
				name: req.body.name,
				teamId: crypto.decrypt(req.body.teamId),
				clientId: crypto.decrypt(req.clientId)
			};

			const teamUserObj = [];
			userIds.forEach((id) => {
				teamUser.userId = crypto.decrypt(id);
				teamUserObj.push(teamUser);
			});
			let transaction = await sequelize.transaction();
			TeamUsers.bulkCreate(teamUserObj, { transaction })
				.then(async (response) => {
					await transaction.commit();

					encryptHelper(response);
					res.status(200).send({ message: "Team users are created", data: response });
				})
				.catch(async (err) => {
					if (transaction) await transaction.rollback();

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
			teamUserId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const teamUserObj = { isActive: "N" };
			TeamUsers.update(teamUserObj, { where: { Id: crypto.decrypt(req.body.teamUserId) } })
				.then((response) => {
					res.send({ message: "This team users are deleted", data: response });
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
