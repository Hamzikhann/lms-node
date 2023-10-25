const db = require("../../models");
const Joi = require("@hapi/joi");

const CourseDepartment = db.courseDepartments;

const create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			courseId: Joi.number().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			// emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			CourseDepartment.findOne({ where: { title: req.body.title } })
				.then((response) => {
					if (response) {
						res.send({ message: "This Department Already Exists" });
					} else {
						let departmentObj = {
							title: req.body.title,
							courseId: req.body.courseId
						};
						CourseDepartment.create(departmentObj)
							.then((response) => {
								res.status(200).send({ message: "Course Department is created", data: response });
							})
							.catch((err) => {
								// emails.errorEmail(req, err);
								res.status(500).send({
									message: err.message || "Some error occurred while creating Course Department."
								});
							});
					}
				})
				.catch((err) => {
					// emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred while creating Course Department."
					});
				});
		}
	} catch (err) {
		// emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

const getAllCourseDepartments = async (req, res) => {
	try {
		CourseDepartment.findAll({ where: { isActive: "Y" } })
			.then((response) => {
				res.status(200).send({ message: "All Course Departments are retrived", data: response });
			})
			.catch((err) => {
				// emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while creating Course Department."
				});
			});
	} catch (err) {
		// emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

module.exports = { create, getAllCourseDepartments };
