const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseFaqs = db.courseFaqs;

exports.create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			description: Joi.string().max(255).required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const faqsObj = {
				title: req.body.title,
				description: req.body.description,
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
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

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
			CourseFaqs.findAll({ where: { courseId: courseId, isActive: "Y" } })
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "Course FAQs list has been retrived", data: response });
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
			title: Joi.string().max(255).required(),
			description: Joi.string().max(255).required(),
			faqId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const faqId = crypto.decrypt(req.body.faqId);
			const faqsObj = {
				title: req.body.title,
				description: req.body.description
			};

			const upatedFaq = await CourseFaqs.update(faqsObj, { where: { id: faqId } });
			if (upatedFaq == 1) {
				res.status(200).send({ message: "Course FAQ has been updated" });
			} else {
				res.status(500).send({
					message: "Unable to update course faq, maybe the faq doesnt exists"
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
			faqId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const faqId = crypto.decrypt(req.body.faqId);
			const faqsObj = {
				isActive: "N"
			};

			const faqs = await CourseFaqs.update(faqsObj, { where: { id: faqId } });
			if (faqs == 1) {
				res.status(200).send({ message: "Course FAQ has been deleted" });
			} else {
				res.status(500).send({
					message: "Unable to delete course faq, maybe the faq doesn;t exists"
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
