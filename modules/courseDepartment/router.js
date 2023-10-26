"use strict";
const express = require("express");
const router = express.Router();
const courseDepartmentController = require("./courseDepartment.controller");

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
