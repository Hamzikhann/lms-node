"use strict";

const express = require("express");
const router = express.Router();
const courseTaskController = require("./courseTask.controller");
const fileUpload = require("../../utils/fileUpload");
const { upload } = fileUpload("documents");

router.post("/list/types", courseTaskController.listTypes);

router.post("/detail", (req, res) => {
	if (req.role == "User") {
		courseTaskController.detailForUser(req, res);
	} else if (req.role == "Administrator" || req.role == "Client") {
		courseTaskController.detail(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/enrollment", courseTaskController.getEnrollment);

router.post("/create", upload.single("handout"), (req, res) => {
	if (req.role == "Administrator") {
		courseTaskController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", upload.single("handout"), (req, res) => {
	if (req.role == "Administrator") {
		courseTaskController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseTaskController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/progress", (req, res) => {
	if (req.role == "User") {
		courseTaskController.createProgress(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/due", (req, res) => {
	if (req.role == "User") {
		courseTaskController.nextCourse(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
