const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { Op } = require("sequelize");

const Users = db.users;
const Clients = db.clients;
const CourseDepartments = db.courseDepartments;
const CourseEnrollments = db.courseEnrollments;
const CourseEnrollmentTypes = db.courseEnrollmentTypes;
const UserDepartments = db.userDepartments;

exports.list = async (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);
		const enrollments = CourseAssignments.findAll({
			where: { clientId, isActive: "Y" },
			include: [
				{
					model: CourseEnrollments,
					where: { isActive: "Y" },
					include: [
						{
							model: CourseEnrollmentTypes,
							attributes: ["title"]
						},
						{
							model: UserDepartments,
							attributes: ["title"]
						}
					],
					attributes: { exclude: ["isActive", "createdAt", "updatedAt", "userDepartmentId"] }
				},
				{
					model: Courses,
					where: { isActive: "Y", status: "P" },
					attributes: ["title", "code", "level", "language", "level"]
				}
			],
			attributes: ["id", "courseId"]
		});

		res.send({
			message: "Assigned courses enrollments list retrieved",
			data: enrollments
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
			required: Joi.string().required(),
			assignmentId: Joi.string().required(),
			courseEnrollmentTypeId: Joi.string().required(),
			userDepartmentId: Joi.string().optional().allow(null).allow(""),
			userId: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.assignmentId);
			const courseEnrollmentTypeId = courseEnrollmentTypeId ? crypto.decrypt(req.body.courseEnrollmentTypeId) : null;
			const userDepartmentId = req.body.userDepartmentId ? crypto.decrypt(req.body.userDepartmentId) : null;
			const userId = req.body.userId ? crypto.decrypt(req.body.userId) : null;

			const enrollmentExists = await CourseEnrollments.findOne({
				where: {
					courseAssignmentId: courseAssignmentId,
					courseEnrollmentTypeId,
					isActive: "Y"
				}
			});
			if (enrollmentExists && courseEnrollmentTypeId == 1) {
				res.status(401).send({
					message: "Unable to enroll course, it is already enrolled to all users.."
				});
			} else if (enrollmentExists && enrollmentExists.userDepartmentId == userDepartmentId) {
				res.status(401).send({
					message: "Unable to enroll course, it is already enrolled to this department."
				});
			} else if (enrollmentExists && enrollmentExists.userId == userId) {
				res.status(401).send({
					message: "Unable to enroll course, it is already enrolled to this user."
				});
			} else {
				const enrollmentObj = {
					required: req.body.required,
					courseEnrollmentTypeId,
					courseAssignmentId,
					userDepartmentId,
					userId
				};
				const response = await CourseEnrollments.create(enrollmentObj);
				res.send({
					message: "All users have been enrolled to this course already",
					data: response
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
			enrollmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const enrollmentId = crypto.decrypt(req.body.enrollmentId);
			const enrollment = { isActive: "N" };

			const updatedObj = await CourseEnrollments.update(enrollment, {
				where: { id: enrollmentId, isActive: "Y" }
			});

			if (updatedObj == 1) {
				res.status(200).send({
					message: "Course enrollment deleted"
				});
			} else {
				res.status(400).send({
					message: "Unable to delete course enrollment, maybe it doesn't exists"
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
