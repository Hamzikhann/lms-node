const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseFaqs = db.courseFaqs;

const create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			discription: Joi.string().required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			CourseFaqs.findOne({
				where: {
					title: req.body.title,
					discription: req.body.discription,
					courseId: crypto.decrypt(req.body.courseId)
				}
			})
				.then((response) => {
					if (response) {
						res.status(200).send({ message: "This Course FQA already exists." });
					} else {
						const faqsObj = {
							title: req.body.title,
							discription: req.body.discription,
							courseId: crypto.decrypt(req.body.courseId)
						};

						CourseFaqs.create(faqsObj)
							.then((response) => {
								res.status(200).send({ message: "FAQS of Course are created", data: response });
							})
							.catch((err) => {
								emails.errorEmail(req, err);

								res.status(500).send({
									message: "Some error occurred."
								});
							});
					}
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
		CourseFaqs.findAll({ where: { isActive: "Y" } })
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All FAQS are retrived", data: response });
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
			discription: Joi.string().required(),
			faqsId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const faqsId = crypto.decrypt(req.body.faqsId);
			const faqsObj = {
				title: req.body.title,
				discription: req.body.discription
			};

			const upatedFaqs = await CourseFaqs.update(faqsObj, { where: { id: faqsId } });

			if (upatedFaqs) {
				res.status(200).send({ message: "Course FAQS are updated", data: upatedFaqs });
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
			faqsId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const faqsId = crypto.decrypt(req.body.faqsId);

			const faqsObj = {
				isActive: "N"
			};

			const faqs = await CourseFaqs.update(faqsObj, { where: { id: faqsId } });

			if (faqs == 1) {
				res.status(200).send({ message: "This FAQ is deleted", data: faqs });
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
