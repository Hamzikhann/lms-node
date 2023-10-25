"use strict";
const jwt = require("../utils/jwt");

const authenticationRouteHandler = require("../modules/authentication/router");
const rolesRouteHandler=require("../modules/roles/router");
const classRouteHandler=require("../modules/classes/router")
const courseRouteHadler=require("../modules/courses/router")
const learningPathRouteHandler=require("../modules/learningPaths/router")
const usersRouteHandler=require("../modules/users/router")
class Routes {
	constructor(app) {
		this.app = app;
	}
	appRoutes() {
		this.app.use("/api/auth", authenticationRouteHandler);
		this.app.use("/api/roles", rolesRouteHandler);
		this.app.use("/api/classes",classRouteHandler);
		this.app.use("/api/courses",courseRouteHadler)
		this.app.use("/api/learningPaths",learningPathRouteHandler);
		this.app.use("/api/users",jwt.protect,usersRouteHandler)
	}
	routesConfig() {
		this.appRoutes();
	}
}
module.exports = Routes;
