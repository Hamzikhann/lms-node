"use strict";

const express = require("express");
const router = express.Router();
const courseTaskController = require("./courseTask.controller");

router.post("/list", courseTaskController.list);
router.post("/list/types", courseTaskController.listTypes);
router.post("/detail", courseTaskController.detail);

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseTaskController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
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
