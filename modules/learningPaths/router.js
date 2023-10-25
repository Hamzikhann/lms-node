"use strict";
const learningController = require("./learningPaths.controller");
const express = require("express");
const router = express.Router();

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		learningController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		learningController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		learningController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		learningController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
