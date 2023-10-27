"use strict";

const express = require("express");
const router = express.Router();
const courseController = require("./course.controller");

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		courseController.list(req, res);
	} else if (req.role == "Client") {
		courseController.listForClient(req, res);
	} else if (req.role == "User") {
		courseController.listForUser(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/enroll", (req, res) => {
	if (req.role == "Administrator") {
		courseController.courseEnrollmeent(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", (req, res) => {
	courseController.detail(req, res);
});

router.post("/delete", (req, res) => {
	if (req.role == "Admin") {
		courseController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
