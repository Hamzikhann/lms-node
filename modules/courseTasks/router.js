"use strict";

const express = require("express");
const router = express.Router();
const courseTaskController = require("./courseTask.controller");

router.post("/create", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseTaskController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseTaskController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseTaskController.detail(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseTaskController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseTaskController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
