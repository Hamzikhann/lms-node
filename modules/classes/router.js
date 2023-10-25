"use strict";
const classesController = require("./classes.controller");
const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
	if (req.role == "Admin") {
		classesController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.get("/", (req, res) => {
	if (req.role == "Admin" || req.role == "Client" || req.role == "User") {
		classesController.findClasseswithCourses(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.get("/:classId", (req, res) => {
	classesController.findClassById(req, res);
});
router.put("/:classId", (req, res) => {
	if (req.role == "Admin") {
		classesController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.delete("/:classId", (req, res) => {
	if (req.role == "Admin") {
		classesController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
module.exports = router;
