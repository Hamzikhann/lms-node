const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const learningPaths = db.learningPaths;
const Classes = db.classes;
const Joi = require("@hapi/joi");

exports.findAll = (req, res) => {
	try {
		learningPaths
			.findAll({
				where: { isActive: "Y" },
				include: [
					{
						model: Classes,
						where: { isActive: "Y" },
						required: false,
						attributes: ["id", "title", "isActive"]
					}
				],
				attributes: ["id", "title"]
			})
			.then((data) => {
				encryptHelper(data);
				res.send({
					message: "Learning paths list retrieved",
					data
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving roles."
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
			const learning = await learningPaths.findOne({
				where: { title: req.body.title?.trim(), isActive: "Y" }
			});
			if (learning) {
				res.status(401).send({
					mesage: "This learning path is already registered."
				});
			} else {
				const learningObj = {
					title: req.body.title
				};
				let transaction = await sequelize.transaction();
				learningPaths
					.create(learningObj, { transaction })
					.then(async (data) => {
						await transaction.commit();

						encryptHelper(data);
						res.status(200).send({
							message: "Learning path created successfully.",
							data
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
