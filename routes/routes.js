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

class Routes {
	constructor(app) {
		this.app = app;
	}
	appRoutes() {
		this.app.use("/api/auth", authenticationRouteHandler);
		this.app.use("/api/roles", jwt.protect, rolesRouteHandler);
		this.app.use("/api/clients", jwt.protect, clientsRouteHandler);
		this.app.use("/api/learningPaths", jwt.protect, learningPathRouteHandler);
		this.app.use("/api/classes", jwt.protect, classRouteHandler);
		this.app.use("/api/courses", jwt.protect, courseRouteHadler);
		this.app.use("/api/users", jwt.protect, usersRouteHandler);
		this.app.use("/api/courseDepartment", jwt.protect, courseDepartmentRouteHandler);
	}
	routesConfig() {
		this.appRoutes();
	}
}
module.exports = Routes;
