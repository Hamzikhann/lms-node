const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const Classes = db.classes;
const Courses = db.courses;

const Joi = require("@hapi/joi");

exports.list = async (req, res) => {
	try {
		const learningPathId = crypto.decrypt(req.body.learningPathId);
		Classes.findAll({
			where: { isActive: "Y", learningPathId },
			attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
		})
			.then((data) => {
				encryptHelper(data);
				res.send({
					message: "Classes retrieved",
					data
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Classes."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
exports.detail = async (req, res) => {
	try {
		Classes.findOne({
			where: { id: crypto.decrypt(req.params.classId), isActive: "Y" },
			attributes: { exclude: ["isActive"] }
		})
			.then((data) => {
				encryptHelper(data);
				res.send({
					message: "Class retrieved",
					data
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while retrieving Classes."
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
			const classObj = {
				title: req.body.title.trim(),
				learningPathId: req.body.leaningPathId
			};

			const alreadyExist = await Classes.findOne({
				where: {
					title: classObj.title
				},
				attributes: ["id"]
			});
			if (alreadyExist) {
				res.status(405).send({
					title: "Already exist.",
					message: "Class with this title already exist."
				});
			} else {
				Classes.create(classObj)
					.then(async (data) => {
						res.status(200).send({
							message: "Class created successfully.",
							data
						});
					})
					.catch(async (err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred while creating the Quiz."
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
exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const classId = crypto.decrypt(req.params.classId);

			const alreadyExist = await Classes.findOne({
				where: {
					title: req.body.title.trim()
				},
				attributes: ["id"]
			});
			if (alreadyExist) {
				res.status(405).send({
					title: "Already exist.",
					message: "Class already exist with same name."
				});
			} else {
				Classes.update({ title: req.body.title.trim() }, { where: { id: classId, isActive: "Y" } })
					.then((num) => {
						if (num == 1) {
							res.send({
								message: "Class info updated successfully."
							});
						} else {
							res.send({
								message: `Cannot update Class. Maybe Class was not found or req.body is empty!`
							});
						}
					})
					.catch((err) => {
						emails.errorEmail(req, err);
						res.status(500).send({
							message: "Error updating Class"
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
exports.delete = async (req, res) => {
	try {
		const classId = crypto.decrypt(req.params.classId);
		Classes.update(
			{ isActive: "N" },
			{
				where: { id: classId }
			}
		)
			.then(async (num) => {
				if (num == 1) {
					res.send({
						message: "Class deleted successfully."
					});
				} else {
					res.send({
						message: `Cannot delete Class. Maybe Class not found!`
					});
				}
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: "Error deleting Class"
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
