"use strict";

const express = require("express");
const router = express.Router();

const courseObjectiveController = require("./courseObjective.controller");

router.post("/list", courseObjectiveController.list);

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseObjectiveController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseObjectiveController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseObjectiveController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
