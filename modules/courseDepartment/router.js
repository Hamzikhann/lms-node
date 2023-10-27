"use strict";
const courseDepartmentController = require("./courseDepartment.controller");
const express = require("express");
const router = express.Router();

router.post("/list", courseDepartmentController.list(req, res));

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseDepartmentController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseDepartmentController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseDepartmentController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
