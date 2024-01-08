"use strict";

const express = require("express");
const router = express.Router();

const courseModuleController = require("./courseModule.controller");

router.post("/list", (req, res) => {
	courseModuleController.list(req, res);
});

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseModuleController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseModuleController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseModuleController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/check", (req, res) => {
	courseModuleController.checkCourseCompletion(req, res);
});
module.exports = router;
