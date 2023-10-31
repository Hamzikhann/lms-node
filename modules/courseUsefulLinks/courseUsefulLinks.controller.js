const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const UsefulLinks = db.courseUsefulLinks;

exports.list = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseId = crypto.decrypt(req.body.courseId);
			UsefulLinks.findAll({ where: { courseId: courseId, isActive: "Y" } })
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "All links has been retrived", data: response });
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

exports.create = (req, res) => {
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

exports.update = async (req, res) => {
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
			const linkId = crypto.decrypt(req.body.linkId);
			const linksObj = {
				title: req.body.title,
				description: req.body.description,
				linkUrl: req.body.linkUrl
			};

			const updatedLink = await UsefulLinks.update(linksObj, { where: { id: linkId } });
			if (updatedLink == 1) {
				res.status(200).send({ message: "Course Useful Links has been updated" });
			} else {
				res.status(500).send({ message: "Unable to update course useful link, maybe this doesn't exists", data: link });
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

			const link = await UsefulLinks.update(linksObj, { where: { id: linkId } });
			if (link == 1) {
				res.status(200).send({ message: "This course useful link has been deleted", data: link });
			} else {
				res.status(500).send({ message: "Unable to delete course useful link, maybe this doesn't exists", data: link });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
