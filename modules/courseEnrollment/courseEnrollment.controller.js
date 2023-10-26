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

const enrollment = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			userId: Joi.string().required().allow(null),
			clientId: Joi.string().required().allow(null),
			courseDepartmentId: Joi.string().required().allow(null),
			courseId: Joi.string().required().allow(null)
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userId = crypto.decrypt(req.body?.userID);
			const clientId = crypto.decrypt(req.body?.clientId);
			const courseDepartmentId = crypto.decrypt(req.body?.courseDepartmentId);
			const courseId = crypto.decrypt(req.body?.courseId);

			if (clientId && courseId) {
				let userToEnroll = await Users.findAll({ where: { clientId: clientId } });
				console.log(userToEnroll);
				const enrollmentObj = {
					courseId,
					userId
				};
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
