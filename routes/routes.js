"use strict";
const jwt = require("../utils/jwt");

const authenticationRouteHandler = require("../modules/authentication/router");
const rolesRouteHandler = require("../modules/roles/router");
const clientsRouteHandler = require("../modules/clients/router");
const classRouteHandler = require("../modules/classes/router");
const courseRouteHadler = require("../modules/courses/router");
const learningPathRouteHandler = require("../modules/learningPaths/router");
const usersRouteHandler = require("../modules/users/router");
const courseDepartmentRouteHandler = require("../modules/courseDepartment/router");
const courseBooksRouteHandler = require("../modules/courseBooks/router");
const courseUsefulLinksRouteHandler = require("../modules/courseUsefulLinks/router");
const couresFaqsRouteHandler = require("../modules/courseFaqs/router");
const courseObjectiveRouteHandler = require("../modules/courseObjectives/router");
const courseModuleRouteHandler = require("../modules/courseModule/router");
const courseTaskRouteHandler = require("../modules/courseTasks/router");
const courseEnrollmentRouteHandler = require("../modules/courseEnrollment/router");

class Routes {
	constructor(app) {
		this.app = app;
	}
	appRoutes() {
		this.app.use("/api/auth", authenticationRouteHandler);
		this.app.use("/api/roles", rolesRouteHandler);
		this.app.use("/api/clients", jwt.protect, clientsRouteHandler);
		this.app.use("/api/learning-paths", jwt.protect, learningPathRouteHandler);
		this.app.use("/api/learning-paths/classes", jwt.protect, classRouteHandler);
		this.app.use("/api/courses", jwt.protect, courseRouteHadler);
		this.app.use("/api/users", jwt.protect, usersRouteHandler);
		this.app.use("/api/courseDepartment", jwt.protect, courseDepartmentRouteHandler);
		this.app.use("/api/course-books", jwt.protect, courseBooksRouteHandler);
		this.app.use("/api/useful-links", jwt.protect, courseUsefulLinksRouteHandler);
		this.app.use("/api/course-faqs", jwt.protect, couresFaqsRouteHandler);
		this.app.use("/api/course-objectives", jwt.protect, courseObjectiveRouteHandler);
		this.app.use("/api/course-module", jwt.protect, courseModuleRouteHandler);
		this.app.use("/api/course-task", jwt.protect, courseTaskRouteHandler);
		this.app.use("/api/course-enrollment", jwt.protect, courseEnrollmentRouteHandler);
	}
	routesConfig() {
		this.appRoutes();
	}
}
module.exports = Routes;
