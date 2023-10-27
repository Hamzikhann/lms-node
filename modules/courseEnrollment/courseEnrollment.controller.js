const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const Users = db.users;
const Clients = db.clients;
const CourseDepartment = db.courseDepartments;
const CourseEnrollemnt = db.courseEnrollments;
const UserDepartment = db.userDepartments;

const enrollment = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			userId: Joi.string().allow(null),
			clientId: Joi.string().allow(null),
			userDepartmentId: Joi.string().allow(null),
			courseId: Joi.string().required().allow(null)
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			// const userId = crypto.decrypt(req.body.userId);
			// const clientId = crypto.decrypt(req.body.clientId);
			// const courseDepartmentId = crypto.decrypt(req.body.courseDepartmentId);
			// const courseId = crypto.decrypt(req.body.courseId);
			const { userId, clientId, userDepartmentId, courseId } = req.body;
			if (clientId && !userId && !userDepartmentId) {
				let userToEnroll = await Users.findAll({ where: { clientId: crypto.decrypt(clientId) } });
				let enroll = [];

				userToEnroll.forEach((e) => {
					let obj = {
						userId: e.id,
						clientId: crypto.decrypt(clientId),
						courseId: crypto.decrypt(courseId)
					};
					enroll.push(obj);
				});
				console.log(enroll);

				CourseEnrollemnt.bulkCreate(enroll)
					.then((response) => {
						res.send({ data: response });
					})
					.catch((err) => {
						emails.errorEmail(req, err);

						res.status(500).send({
							message: err.message || "Some error occurred."
						});
					});
			} else if (clientId && userDepartmentId && !userId) {
				let userToEnroll = await Users.findAll({
					where: { clientId: crypto.decrypt(clientId), userDepartmentId: crypto.decrypt(userDepartmentId) }
				});
				// console.log(userToEnroll);
				let enroll = [];

				userToEnroll.forEach((e) => {
					let obj = {
						userId: e.id,
						clientId: crypto.decrypt(clientId),
						courseId: crypto.decrypt(courseId)
					};
					enroll.push(obj);
				});
				console.log(enroll);

				CourseEnrollemnt.bulkCreate(enroll)
					.then((response) => {
						res.send({ data: response });
					})
					.catch((err) => {
						emails.errorEmail(req, err);

						res.status(500).send({
							message: err.message || "Some error occurred."
						});
					});
			} else {
				let obj = {
					courseId: crypto.decrypt(courseId),
					userId: crypto.decrypt(userId),
					clientId: crypto.decrypt(clientId)
				};
				CourseEnrollemnt.create(obj)
					.then((response) => {
						encryptHelper(response);
						res.status(200).send({ data: response });
					})
					.catch((err) => {
						emails.errorEmail(req, err);

						res.status(500).send({
							message: err.message || "Some error occurred."
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

module.exports = { enrollment };
