"use strict";

const express = require("express");
const router = express.Router();
const courseController = require("./course.controller");
const fileUpload = require("../../utils/fileUpload");

const { upload } = fileUpload("instructor");

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

router.post("/list/assigned", (req, res) => {
	if (req.role == "Client") {
		courseController.listAssigned(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/create", upload.single("image"), (req, res) => {
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

router.post("/detail", (req, res) => {
	courseController.detail(req, res);
});

router.post("/enrollment/detail", (req, res) => {
	courseController.detailEnrollment(req, res);
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/reset", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseController.reset(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
