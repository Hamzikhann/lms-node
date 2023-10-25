"use strict";
const courseDepartmentController = require("./courseDepartment.controller");
const express = require("express");
const router = express.Router();

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseDepartmentController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		courseDepartmentController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
