"use strict";

const clientController = require("./clients.controller");

const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
	if (req.role == "Administrator") {
		clientController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/", (req, res) => {
	if (req.role == "Administrator") {
		clientController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
