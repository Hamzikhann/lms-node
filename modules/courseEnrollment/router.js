"use strict";

const express = require("express");
const router = express.Router();

const courseEnrollmentController = require("./courseEnrollment.controller");

router.post("/list", (req, res) => {
	if (req.role == "Client") {
		courseEnrollmentController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list/types", (req, res) => {
	if (req.role == "Client") {
		courseEnrollmentController.listTypes(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/create", (req, res) => {
	if (req.role == "Client") {
		courseEnrollmentController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Client") {
		courseEnrollmentController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
