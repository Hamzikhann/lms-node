"use strict";

const express = require("express");
const router = express.Router();
const courseTaskController = require("./courseTask.controller");
const fileUpload = require("../../utils/fileUpload");
const { upload } = fileUpload("documents");

router.post("/list/types", courseTaskController.listTypes);
router.post("/detail", courseTaskController.detail);
router.post("/enrollment", courseTaskController.getEnrollment);

router.post("/create", upload.single("handout"), (req, res) => {
	console.log(req.role);
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
	courseTaskController.createProgress(req, res);
});
module.exports = router;
