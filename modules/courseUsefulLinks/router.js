"use strict";

const express = require("express");
const router = express.Router();

const usefulLinksController = require("./courseUsefulLinks.controller");

router.post("/list", usefulLinksController.list);

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		usefulLinksController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usefulLinksController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usefulLinksController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
