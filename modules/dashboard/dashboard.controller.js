const db = require("../../models");
const { Op } = require("sequelize");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");
const Sequelize = require("sequelize");
const Users = db.users;
const Roles = db.roles;
const Clients = db.clients;
const Courses = db.courses;
const CourseTasks = db.courseTasks;
const CourseEnrollments = db.courseEnrollments;
const CourseAssignments = db.courseAssignments;
const CourseDepartments = db.courseDepartments;
const CourseTaskAssessments = db.courseTaskAssessments;
const CourseEnrollmentUsers = db.courseEnrollmentUsers;
const CourseTaskProgress = db.courseTaskProgress;
const CourseModules = db.courseModules;
const CourseTaskTypes = db.courseTaskTypes;
const CourseSyllabus = db.courseSyllabus;

exports.adminDashboard = async (req, res) => {
	try {
		const clients = await Clients.findAll({
			include: [
				{
					model: Users,
					where: { isActive: "Y" },
					required: false,
					attributes: { exclude: ["isActive", "createdAt", "updatedAt"] },
					include: [
						{
							model: Courses,
							where: { isActive: "Y" },
							required: false,
							attributes: { exclude: ["isActive", "createdAt", "updatedAt"] },
							include: [
								{
									model: CourseTasks,
									where: { isActive: "Y" },
									required: false,
									attributes: { exclude: ["isActive", "createdAt", "updatedAt"] }
								}
							]
						}
					]
				}
			]
		});
		const dashboardData = clients.map((client) => {
			const users = client.users.map((user) => {
				const courses = user.courses.map((course) => {
					const totalTasks = course.courseTasks.length;
					const draftTasks = course.courseTasks.filter((task) => task.status === "D").length;
					const publishedTasks = course.courseTasks.filter((task) => task.status === "P").length;

					return {
						...course.toJSON(),
						totalTasks,
						draftTasks,
						publishedTasks
					};
				});

				return {
					...user.toJSON(),
					courses
				};
			});

			return {
				...client.toJSON(),
				users,
				userCount: users.length
			};
		});

		res.json(dashboardData);
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.userDashboard = async (req, res) => {
	try {
		const userId = crypto.decrypt(req.userId);
		const clientId = crypto.decrypt(req.clientId);

		const enrolledCourses = await CourseEnrollments.count({
			where: {
				isActive: "Y"
			},
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y", status: "P" }
						}
					]
				},
				{
					model: CourseEnrollmentUsers,
					where: { userId: userId, isActive: "Y" }
				}
			]
		});

		const inProgressCourses = await CourseEnrollments.count({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y", status: "P" }
						}
					]
				},
				{
					model: CourseEnrollmentUsers,
					where: { userId: userId, progress: { [Op.lt]: 100, [Op.gt]: 0 }, isActive: "Y" }
				}
			]
		});

		const CoursesCompletions = await Courses.findAll({
			where: { isActive: "Y" },
			attributes: ["title"],
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: CourseEnrollments,
							where: { isActive: "Y" },
							include: [
								{
									model: CourseEnrollmentUsers,
									where: { userId: userId, isActive: "Y" },
									attributes: []
								}
							],
							// attributes: ["courseProgress", "completionDateOne"]
							attributes: ["completionDateOne"]
						}
					],
					attributes: ["createdAt"]
				}
			]
		});

		const myCourses = await Courses.findAll({
			model: Courses,
			where: { isActive: "Y" },
			include: [
				{
					model: CourseDepartments,
					attributes: ["title"]
				},
				{
					model: CourseTaskProgress,
					where: { isActive: "Y", userId },
					attributes: []
				},
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: CourseEnrollments,
							where: { isActive: "Y" },
							include: [
								{
									model: CourseEnrollmentUsers,
									where: { userId, isActive: "Y" },
									attributes: []
								}
							],
							attributes: []
						}
					],
					attributes: []
				}
			],
			attributes: [
				"title",
				"code",
				[Sequelize.fn("COUNT", Sequelize.col("courseTaskId")), "tasksTotal"],
				[Sequelize.fn("COUNT", Sequelize.literal("CASE WHEN percentage = 100 THEN 1 ELSE NULL END")), "tasksCompleted"]
			]
		});

		const completedCourses = await CourseEnrollments.count({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y", status: "P" }
						}
					]
				},
				{
					model: CourseEnrollmentUsers,
					where: { progress: { [Op.eq]: 100 }, userId, isActive: "Y" }
				}
			]
		});

		const inQueueCourses = await CourseEnrollments.count({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseAssignments,
					where: { isActive: "Y" },
					include: [
						{
							model: Courses,
							where: { isActive: "Y", status: "P" }
						}
					]
				},
				{
					model: CourseEnrollmentUsers,
					where: { progress: { [Op.eq]: 0 }, userId, isActive: "Y" }
				}
			]
		});

		const tasksCompleted = await CourseTasks.count({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseModules,
					where: { isActive: "Y" },
					include: [
						{
							model: CourseSyllabus,
							where: { isActive: "Y" },
							include: [
								{
									model: Courses,
									where: { isActive: "Y" },
									include: [
										{
											model: CourseAssignments,
											where: { isActive: "Y" },
											include: [
												{
													model: CourseEnrollments,
													where: { isActive: "Y" },
													include: [
														{
															model: CourseEnrollmentUsers,
															where: { userId, isActive: "Y" }
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					model: CourseTaskProgress,
					where: {
						isActive: "Y",
						userId,
						percentage: {
							[Op.eq]: 100
						}
					}
				}
			]
		});

		const tasksTotal = await CourseTasks.count({
			where: { isActive: "Y" },
			include: [
				{
					model: CourseModules,
					where: { isActive: "Y" },
					include: [
						{
							model: CourseSyllabus,
							where: { isActive: "Y" },
							include: [
								{
									model: Courses,
									where: { isActive: "Y" },
									include: [
										{
											model: CourseAssignments,
											where: { isActive: "Y" },
											include: [
												{
													model: CourseEnrollments,
													where: { isActive: "Y" },
													include: [
														{
															model: CourseEnrollmentUsers,
															where: { userId, isActive: "Y" }
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]
		});

		const tasksPercentage = (tasksCompleted / tasksTotal) * 100;

		const taskAssessments = await CourseTaskProgress.findAll({
			where: {
				isActive: "Y",
				userId
			},
			include: [
				{
					model: CourseTasks,
					where: { isActive: "Y" },
					attributes: [],
					include: [
						{
							model: CourseTaskTypes,
							attributes: [],
							where: { isActive: "Y", title: "Assessment" }
						}
					]
				}
			],
			attributes: ["percentage"]
		});

		var taskAssessmentsPercentages = 0;
		taskAssessments.forEach((element) => {
			taskAssessmentsPercentages += Number(element.percentage);
		});

		const taskAssessmentsPercentage = (taskAssessmentsPercentages / taskAssessments.length) * 100;


		const enrollments = await CourseEnrollments.findAll({
			where: { isActive: "Y" },
			attributes: ['id'],
			include: [
				{
					model: CourseTaskProgress,
					where: {
						userId: userId,
						isActive: "Y"
					},
					attributes:["percentage", "id", "courseId"],
					include:[
						{
							model: CourseTasks,
							where: { isActive: "Y" },
							attributes: ["title", "estimatedTime"],
							include: [
								{
									model: CourseTaskTypes,
									where: { isActive: "Y" },
									attributes: ["title"]
								},
								{
									model: CourseModules,
									where: { isActive: "Y" },
									attributes: [],
									include: [
										{
											model: CourseSyllabus,
											where: { isActive: "Y" },
											attributes: [],
											include: [
												{
													model: Courses,
													where: { isActive: "Y" },
													attributes: ["title"]
												}
											]
										}
									]
								}
							]
						}
					]
				},
			],
		})

		const upcomingTasks = {};
		enrollments.forEach(course => {
			course.courseTaskProgresses.forEach(task => {
				const courseId = task.courseId;
				if (task.percentage != "0") {
					return;
				}
				if (!upcomingTasks[courseId]) {
					upcomingTasks[courseId] = task;
				}
			})
		});
		const upcomingTasksArray = Object.values(upcomingTasks);

		const data = {
			stats: {
				enrolled: enrolledCourses,
				inProgress: inProgressCourses,
				completed: completedCourses,
				inQueue: inQueueCourses,
				percentages: {
					task: tasksPercentage,
					assessments: taskAssessmentsPercentage
				}
			},
			courses: {
				enrolled: encryptHelper(myCourses),
				completions: encryptHelper(CoursesCompletions)
			},
			upcomingTasks: upcomingTasksArray
		};

		res.send({
			message: "Retrieved statistics for the user",
			data
		});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.clientDashboard = async (req, res) => {
	try {
		const clientId = crypto.decrypt(req.clientId);
		const assignments = await CourseAssignments.findAll({
			where: {
				clientId: clientId,
				isActive: "Y"
			},
			include: [
				{
					model: Courses,
					where: {
						isActive: "Y",
						status: "P"
					},
					attributes: ["title", "code"],
					include: [
						{
							model: CourseDepartments,
							where: {
								isActive: "Y"
							},
							attributes: ["title"]
						}
					]
				},
				{
					model: CourseEnrollments,
					attributes: [[Sequelize.fn("COUNT", Sequelize.col("courseEnrollments.id")), "enrollmentCount"]],
					where: {
						isActive: "Y"
					}
				}
			],
			attributes: ["id"]
		});

		encryptHelper(assignments);
		res.send({
			message: "Retrieved statistics for the client",
			data: {
				courses: {
					assignedCourses: assignments
				}
			}
		});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred while retrieving assignment courses."
		});
	}
};
