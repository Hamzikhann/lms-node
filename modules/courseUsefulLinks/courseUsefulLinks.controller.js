const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const UsefulLinks = db.courseUsefulLinks;

const create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required(),
			linkUrl: Joi.string().required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const linksObj = {
				title: req.body.title,
				description: req.body.description,
				linkUrl: req.body.linkUrl,
				courseId: crypto.decrypt(req.body.courseId)
			};
			UsefulLinks.create(linksObj)
				.then((response) => {
					res.status(200).send({ message: "Links of Course are created", data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);

					res.status(500).send({
						message: "Some error occurred."
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

const list = (req, res) => {
	try {
		UsefulLinks.findAll({ where: { isActive: "Y" } })
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All links are retrived", data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);

				res.status(500).send({
					message: "Some error occurred."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

const update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required(),
			linkUrl: Joi.string().required(),
			linkId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const bookId = crypto.decrypt(req.body.linkId);
			const linksObj = {
				title: req.body.title,
				description: req.body.description,
				linkUrl: req.body.linkUrl
			};

			const upatedLink = await UsefulLinks.update(linksObj, { where: { id: bookId } });

			if (upatedLink) {
				res.status(200).send({ message: "Course Useful Links are updated", data: upatedLink });
			} else {
				emails.errorEmail(req, err);

				res.status(500).send({
					message: "Some error occurred."
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
			linkId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const linkId = crypto.decrypt(req.body.linkId);

			const linksObj = {
				isActive: "N"
			};

			const link = await CourseFaqs.update(linksObj, { where: { id: linkId } });

			if (link == 1) {
				res.status(200).send({ message: "This Link is deleted", data: link });
			} else {
				emails.errorEmail(req, err);

				res.status(500).send({
					message: "Some error occurred."
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

module.exports = { create, list, update };
