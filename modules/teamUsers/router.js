"use strict";

const express = require("express");
const router = express.Router();

const teamUserController = require("./teamUsers.controller");

router.post("/create", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		teamUserController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		teamUserController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
