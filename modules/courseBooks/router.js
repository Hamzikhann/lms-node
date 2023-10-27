"use strict";

const express = require("express");
const router = express.Router();

const courseBooksController = require("./courseBooks.controller");

router.post("/list", courseBooksController.list);

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseBooksController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseBooksController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseBooksController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
