"use strict";

const express = require("express");
const router = express.Router();

const courseEnrollmentController = require("./courseEnrollment.controller");

router.post("/enroll", (req, res) => {
	console.log(req.role);
	if (req.role == "Administrator" || req.role == "Client") {
		courseEnrollmentController.enrollment(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
