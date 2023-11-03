"use strict";

const express = require("express");
const router = express.Router();

const CourseAssignmentController = require("./courseAssignment.controller");

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		CourseAssignmentController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		CourseAssignmentController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		CourseAssignmentController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
