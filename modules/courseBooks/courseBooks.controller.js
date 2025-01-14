const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const CourseBooks = db.courseBooks;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			edition: Joi.string().max(255).required(),
			author: Joi.string().max(255).required(),
			publisher: Joi.string().max(255).required(),
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			let bookPdf = req.file ? "uploads/documents/" + req.file.filename : null;
			let bookObj = {
				title: req.body.title,
				author: req.body.author,
				edition: req.body.edition,
				publisher: req.body.publisher,
				bookUrl: bookPdf,
				courseId: crypto.decrypt(req.body.courseId)
			};
			let coursebook = await CourseBooks.create(bookObj);

			if (coursebook) {
				res.status(200).send({ message: "Course Book has been uploaded", data: coursebook });
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

exports.list = (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseId = crypto.decrypt(req.body.courseId);
			CourseBooks.findAll({ where: { courseId: courseId, isActive: "Y" } })
				.then((response) => {
					encryptHelper(response);
					res.status(200).send({ message: "All Course books has been retrived", data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);

					res.status(500).send({
						message: err.message || "Some error occurred."
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
			edition: Joi.string().max(255).required(),
			author: Joi.string().max(255).required(),
			publisher: Joi.string().max(255).required(),
			// bookUrl: Joi.string().max(255).required(),
			bookId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const bookId = crypto.decrypt(req.body.bookId);
			let bookPdf = req.file ? "uploads/documents/" + req.file.filename : null;
			let bookObj = {
				title: req.body.title,
				author: req.body.author,
				edition: req.body.edition,
				publisher: req.body.publisher
				// bookUrl: req.body.bookUrl
			};
			if (bookPdf) {
				bookObj.bookUrl = bookPdf;
			}

			let updateBook = await CourseBooks.update(bookObj, { where: { id: bookId } });
			if (updateBook == 1) {
				res.status(200).send({ message: "Course Book has been updated successfully" });
			} else {
				res.status(500).send({
					message: "Unable to update course book details, maybe book doesn't exists"
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
			bookId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const bookId = crypto.decrypt(req.body.bookId);
			const bookObj = {
				isActive: "N"
			};

			const book = await CourseBooks.update(bookObj, { where: { id: bookId } });
			if (book == 1) {
				res.status(200).send({ message: "Course book has been deleted" });
			} else {
				res.status(500).send({
					message: "Unable to delete the course book, maybe the book doent exists"
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
