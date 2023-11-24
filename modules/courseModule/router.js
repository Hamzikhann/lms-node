"use strict";

const express = require("express");
const router = express.Router();

const courseModuleController = require("./courseModule.controller");

router.post("/list", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseModuleController.list(req, res);
	} else if (req.role == "User") {
		courseModuleController.listForUser(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseModuleController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseModuleController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseModuleController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
