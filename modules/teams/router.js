"use strict";

const express = require("express");
const router = express.Router();

const teamController = require("./teams.controller");

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		teamController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list", (req, res) => {
	teamController.list(req, res);
});
router.post("/detail", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		teamController.detail(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/update", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		teamController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		teamController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
