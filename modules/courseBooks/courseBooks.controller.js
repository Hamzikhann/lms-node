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
		}
	} catch (err) {}
};
