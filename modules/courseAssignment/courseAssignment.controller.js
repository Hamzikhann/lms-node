const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const { Sequelize } = require('sequelize');

const Clients = db.clients;
const Courses = db.courses;
const CourseAssignments = db.courseAssignments;
const CourseEnrollments = db.courseEnrollments;
const CourseAchivements = db.courseAchievements;
const Users = db.users;
const UserProfile = db.userProfile;
const UserDepartments = db.userDepartments;
const UserDesignations = db.userDesignations;
const CourseSyllabuses = db.courseSyllabus;
const CourseModules = db.courseModules;
const CourseTasks = db.courseTasks;

exports.list = (req, res) => {
	try {
		Clients.findAll({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					required: false,
					include: [
						{
							model: Courses,
							where: { isActive: "Y" },
							attributes: ["title", "code", "level"]
						}
					],
					attributes: ["id", "courseId", "clientId"]
				}
			],
			attributes: ["id", "name", "logoURL"]
		})
			.then((response) => {
				encryptHelper(response);
				res.status(200).send({
					message: "Clients assigned courses list has been retrived",
					data: response
				});
			})
			.catch((err) => {
				emails.errorEmail(req, err);
				res.status(500).send({
					message: err.message || "Some error occurred."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.create = (req, res) => {
	try {
		const joiSchema = Joi.object({
			// dateFrom: Joi.string().optional(),
			// dateTo: Joi.string().optional(),
			courseId: Joi.string().required(),
			clientId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const assignmentObj = {
				// dateFrom: req.body.dateFrom,
				// dataTo: req.body.dateTo,
				courseId: crypto.decrypt(req.body.courseId),
				clientId: crypto.decrypt(req.body.clientId)
			};
			CourseAssignments.findOne({
				where: {
					courseId: crypto.decrypt(req.body.courseId),
					clientId: crypto.decrypt(req.body.clientId),
					isActive: "Y"
				}
			})
				.then((response) => {
					if (response) {
						res.send({ message: "This course is already assigned to the client. " });
					} else {
						CourseAssignments.create(assignmentObj)
							.then((response) => {
								encryptHelper(response);
								res.status(200).send({ message: "Course has been assigned to the client", data: response });
							})
							.catch((err) => {
								emails.errorEmail(req, err);
								res.status(500).send({
									message: err.message || "Some error occurred."
								});
							});
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});
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
			courseAssignmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.courseAssignmentId);
			const updatedObj = await CourseAssignments.update({ isActive: "N" }, { where: { id: courseAssignmentId } });

			if (updatedObj == 1) {
				res.status(200).send({ message: "Course Assignment has been deleted" });
			} else {
				res.status(200).send({ message: "Unable to delete course assignment" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.report = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseAssignmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const courseAssignmentId = crypto.decrypt(req.body.courseAssignmentId);
			console.log(courseAssignmentId);

			const courseDetail = await Courses.findOne({
				where: { status: "P", isActive: "Y" },
				include: [
					{
						model: CourseAssignments,
						where: { id: courseAssignmentId, isActive: "Y" },
						attributes: []
					}
				],
				attributes: {
					exclude: ["id", "createdAt", "updatedAt", "isActive", "classId", "courseDepartmentId", "status"]
				}
			});

			CourseEnrollments.findAll({
				where: { courseAssignmentId: courseAssignmentId, isActive: "Y" },
				include: [
					{
						model: CourseAchivements,
						where: { isActive: "Y" },
						attributes: ["id", "createdAt", "result"],
						required: false
					},
					{
						model: Users,
						where: { isActive: "Y" },
						include: [
							{
								model: Users,
								as: "manager",
								attributes: ["firstName", "lastName"]
							},
							{
								model: UserDepartments,
								attributes: ["title"]
							},
							{
								model: UserDesignations,
								attributes: ["title"]
							}
						],
						attributes: ["firstName", "lastName", "email"]
					}
				],
				attributes: ["id", "courseProgress"]
			})
				.then((response) => {
					encryptHelper(response);
					encryptHelper(courseDetail);
					const obj = {
						courseDetail: courseDetail,
						courseEnrollments: response
					};
					res.send({ message: "All reports of the clients are retrived", data: obj });
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};


// exports.getCourseAssignmentsUsersTasks = async (req, res) => {
//     try {
//         const courseId = req.body.courseId;
// 		encryptHelper(courseId);
//         const course = await Courses.findById(courseId);
//         const enrollments = await CourseEnrollments.find({ courseId: courseId });

//         // Group enrollments by completion date
//         const completedGroups = enrollments.reduce((groups, enrollment) => {
//             const date = enrollment.completionDate.toISOString().split('T')[0];
//             if (!groups[date]) {
//                 groups[date] = [];
//             }
//             groups[date].push(enrollment);
//             return groups;
//         }, {});

//         // Get tasks and enrollment counts
//         const tasks = course.tasks;
//         const taskDetails = await Promise.all(tasks.map(async (task) => {
//             const enrolledCount = await CourseEnrollments.countDocuments({ courseId: courseId, taskId: task._id });
//             const completedCount = await CourseEnrollments.countDocuments({ courseId: courseId, taskId: task._id, progress: 100 });
//             return { task, enrolledCount, completedCount };
//         }));

//         res.json({
//             course,
//             enrollments,
//             completedGroups,
//             taskDetails
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };


exports.getCourseAssignmentsUsersTasks = async (req, res) => {
	try {
	  const courseId = crypto.decrypt(req.body.courseId);
	  const clientId = crypto.decrypt(req.clientId)
  
	  const assignment = await CourseAssignments.findOne({
		where: {
		  courseId: courseId,
		  clientId: clientId,
		  isActive: "Y"
		},
		include: [
		  {
			model: CourseEnrollments,
			where: {
			  isActive: "Y"
			},
			attributes: [
			  "courseProgress","updatedAt",
			  [Sequelize.fn("COUNT", Sequelize.col("courseEnrollments.id")), "enrollmentCount"]
			],
			group: ["courseProgress", "courseEnrollments.updatedAt"],
			order: [["courseEnrollments.updatedAt", "DESC"]]
		  }
		]
	  });
  
	  if (!assignment) {
		return res.status(404).send({
		  message: "No assignment found for the given courseId."
		});
	  }
	  
	  const courseSyllabus = await CourseSyllabuses.findOne({
		where: {
		  courseId: courseId,
		  isActive: "Y"
		},
		include: [
		  {
			model: CourseModules,
			where: {
			  isActive: "Y"
			},
			include: [
			  {
				model: CourseTasks,
				where: {
				  isActive: "Y"
				},
				attributes: [
				  "title",
				  "description",
				  "estimatedTime",
				//   [Sequelize.fn("COUNT", Sequelize.col("courseTasks.id")), "taskCount"]
				],
				group: ["title", "description", "estimatedTime", "courseTasks.updatedAt"],
				order: [["courseTasks.updatedAt", "DESC"]]
			  }
			]
		  }
		]
	  });
	
	  if (!courseSyllabus) {
		return res.status(404).send({
		  message: "No course syllabus/task found for the given courseId."
		});
	  }
  
	  encryptHelper(assignment);
	  encryptHelper(courseSyllabus);
	  res.send({
		message: "Retrieved statistics for the course.",
		data: {
			assignedCourses: assignment,
			courseTasks: courseSyllabus
		}
	  });
	} catch (err) {
	  emails.errorEmail(req, err);
	  res.status(500).send({
		message: err.message || "Some error occurred while retrieving assigned courses details."
	  });
	}
  };
  