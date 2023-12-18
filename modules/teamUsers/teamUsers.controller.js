const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { sequelize } = require("../../models");

const TeamUsers = db.teamUsers;
const CourseEnrollments = db.courseEnrollments;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			userIds: Joi.any().required(),
			teamId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userIds = req.body.userIds;

			const existedUsesr = await TeamUsers.findAll({
				where: { teamId: crypto.decrypt(req.body.teamId), isActive: "Y" },
				attributes: ["userId"]
			});
			encryptHelper(existedUsesr);
			var existedUsesrIds = existedUsesr.map((obj) => obj.userId);

			var uniqueUsers = userIds.filter((item) => !existedUsesrIds.includes(item));

			let teamUserObj = [];
			uniqueUsers.forEach((id) => {
				let teamUser = {
					teamId: crypto.decrypt(req.body.teamId),
					clientId: crypto.decrypt(req.clientId),
					userId: crypto.decrypt(id)
				};
				teamUserObj.push(teamUser);
			});
			// console.log(teamUserObj);
			let transaction = await sequelize.transaction();
			TeamUsers.bulkCreate(teamUserObj, { transaction })
				.then(async (response) => {
					const team = await CourseEnrollments.findAll({
						where: { teamId: crypto.decrypt(req.body.teamId), isActive: "Y" },
						attributes: ["courseAssignmentId"],
						raw: true
					});
					const userExistedCourses = await CourseEnrollments.findAll({
						where: { userId: crypto.decrypt(uniqueUsers[0]), isActive: "Y" },
						attributes: ["courseAssignmentId"],
						raw: true
					});
					const teamIds = team.map((item) => item.courseAssignmentId);
					const userExistedCoursesIds = userExistedCourses.map((item) => item.courseAssignmentId);

					var uniqueid = teamIds.filter((item) => !userExistedCoursesIds.includes(item));
					if (uniqueid) {
						const enrollmentObj = [];
						uniqueid.forEach((e) => {
							uniqueUsers.forEach((j) => {
								let obj = {
									userId: crypto.decrypt(j),
									courseAssignmentId: e,
									teamId: crypto.decrypt(req.body.teamId),
									courseEnrollmentTypeId: 3
								};
								enrollmentObj.push(obj);
							});
						});
						console.log(enrollmentObj);
						const courseEnrollment = await CourseEnrollments.bulkCreate(enrollmentObj, { transaction });
					}

					await transaction.commit();
					encryptHelper(response);
					res.status(200).send({
						message: "Team users are created",
						data: response
					});
				})
				.catch(async (err) => {
					if (transaction) await transaction.rollback();

					emails.errorEmail(req, err);
					console.log(err);
					res.status(500).send({
						message: err.message || "Some error occurred while creating the Quiz."
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		console.log(err);
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};

exports.delete = (req, res) => {
	try {
		const joiSchema = Joi.object({
			teamUserId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const teamUserObj = { isActive: "N" };
			TeamUsers.update(teamUserObj, { where: { Id: crypto.decrypt(req.body.teamUserId) } })
				.then((response) => {
					res.send({ message: "This team users are deleted", data: response });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred while creating the Quiz."
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Quiz."
		});
	}
};
