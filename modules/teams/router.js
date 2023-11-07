"use strict";

const express = require("express");
const router = express.Router();

const teamController = require("./teams.controller");

router.post("/list", teamController.list);

router.post("/create", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		teamController.create(req, res);
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
	if (req.role == "Administrator" || req.role == "Client") {
		teamController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
