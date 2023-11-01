const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const Joi = require("@hapi/joi");

const CourseDepartment = db.courseDepartments;

exports.list = async (req, res) => {
	try {
		CourseDepartment.findAll({
			where: { isActive: "Y" },
			attributes: ["id", "title"]
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({ message: "All Course Department has been retrived", data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retreiving course departments."
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
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseExists = await CourseDepartment.findOne({ where: { title: req.body.title } });
			if (courseExists) {
				res.send({ message: "This course department already exists" });
			} else {
				let departmentObj = {
					title: req.body.title
				};
				CourseDepartment.create(departmentObj)
					.then((response) => {
						encryptHelper(response);
						res.status(200).send({ message: "Course Department has been created", data: response });
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred while creating Course Department."
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

exports.upate = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			departmentId: Joi.string().required(),
			title: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const departmentId = crypto.decrypt(req.body.departmentId);
			let departmentObj = {
				title: req.body.title
			};

			const departmentUpdated = await CourseDepartment.update(departmentObj, { where: { id: departmentId } });
			if (departmentUpdated == 1) {
				res.status(200).send({ message: "Course Department has been updated" });
			} else {
				res.status(500).send({ message: "Unable to update course department, maybe course department doesn't exists" });
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
			departmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const departmentId = crypto.decrypt(req.body.departmentId);
			let departmentObj = {
				isActive: "N"
			};

			const departmentUpdated = await CourseDepartment.update(departmentObj, { where: { id: departmentId } });
			if (departmentUpdated == 1) {
				res.status(200).send({ message: "Course Department has been deleted" });
			} else {
				res.status(500).send({ message: "Unable to delete course department, maybe course department doesn't exists" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
