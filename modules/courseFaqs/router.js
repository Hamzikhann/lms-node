"use strict";

const faqsController = require("./courseFaqs.controller");

const express = require("express");
const router = express.Router();

router.post("/list", faqsController.list);

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		faqsController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		faqsController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		faqsController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
module.exports = router;
