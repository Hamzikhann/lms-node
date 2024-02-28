const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const CourseAchievements = db.courseAchievements;
const CourseAssignments = db.courseAssignments;
const CourseEnrollments = db.courseEnrollments;
const CourseEnrollmentUsers = db.courseEnrollmentUsers;

exports.list = (req, res) => {
	try {
		const userId = crypto.decrypt(req.userId);
		const clientId = crypto.decrypt(req.clientId);
		const courseId = crypto.decrypt(req.body.courseId);

		var whereAssignments = {
			clientId,
			isActive: "Y"
		};
		if (courseId) whereAssignments.courseId = courseId;
		// console.log(CourseEnrollments, CourseEnrollmentUsers);

		CourseAchievements.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseEnrollmentUsers,
					where: { userId, isActive: "Y" },
					include: [
						{
							model: CourseEnrollments,
							where: { isActive: "Y" },
							include: [
								{
									model: CourseAssignments,
									where: whereAssignments,
									attributes: []
								}
							],
							attributes: []
						}
					],
					attributes: []
				}
			],
			order: [["id", "DESC"]],
			attributes: ["id", "createdAt", "courseEnrollmentUserId", "result"]
		})
			.then((response) => {
				encryptHelper(response);
				res.send({ data: response });
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred while creating the Quiz."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};
