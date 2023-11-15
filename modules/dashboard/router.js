"use strict";

const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");

router.post("/", (req, res) => {
	if (req.role == "Administrator") {
		dashboardController.findAllforAdministrator(req, res);
	} else if (req.role == "User") {
		dashboardController.userDashboard(req, res);
	}
});

module.exports = router;
