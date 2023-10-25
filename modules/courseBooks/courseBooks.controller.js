const db = require("../../models");

const Books = db.courseBooks;

const create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			edition: Joi.string().required(),
			author: Joi.string().required(),
			publisher: Joi.string().required(),
			bookURL: Joi.string().required(),
			courseId: Joi.number().required()
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
				bookURL: req.body.bookurl,
				courseId: req.body.courseId
			};
			let coursebook = await Books.create(bookObj);

			if (coursebook) {
				res.status(200).send({ message: "Course Book is uploaded" });
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
	} catch (err) {}
};
