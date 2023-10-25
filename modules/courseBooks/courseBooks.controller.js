const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const Books = db.courseBooks;

const create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			edition: Joi.string().required(),
			author: Joi.string().required(),
			publisher: Joi.string().required(),
			bookUrl: Joi.string().required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			let bookObj = {
				title: req.body.title,
				author: req.body.author,
				edition: req.body.edition,
				publisher: req.body.publisher,
				bookUrl: req.body.bookUrl,
				courseId: crypto.decrypt(req.body.courseId)
			};
			let coursebook = await Books.create(bookObj);

			if (coursebook) {
				res.status(200).send({ message: "Course Book is uploaded", data: coursebook });
			} else {
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

const list = (req, res) => {
	try {
		Books.findAll({ where: { isActive: "Y" } })
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All Books are retrived", data: response });
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

const update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			edition: Joi.string().required(),
			author: Joi.string().required(),
			publisher: Joi.string().required(),
			bookUrl: Joi.string().required(),
			bookId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const bookId = crypto.decrypt(req.body.bookId);
			let bookObj = {
				title: req.body.title,
				author: req.body.author,
				edition: req.body.edition,
				publisher: req.body.publisher,
				bookUrl: req.body.bookUrl
			};

			let updateBook = await Books.update(bookObj, { where: { id: bookId } });
			if (updateBook) {
				res.status(200).send({ message: "Course Book is updated successfully", data: updateBook });
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
