"use strict";

const express = require("express");
const router = express.Router();
const InstructorController = require("./courseInstructor.controller");
const fileUpload = require("../../utils/fileUpload");

const { upload } = fileUpload("instructor");

router.post("/update", upload.single("image"), (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		InstructorController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		InstructorController.detail(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
