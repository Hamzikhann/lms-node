"use strict";
const classesController = require("./classes.controller");
const express = require("express");
const router = express.Router();

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		classesController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/create", (req, res) => {
	console.log(req.role);
	if (req.role == "Administrator") {
		classesController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/detail", (req, res) => {
	classesController.detail(req, res);
});
router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		classesController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		classesController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
