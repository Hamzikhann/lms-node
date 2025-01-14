"use strict";

const express = require("express");
const router = express.Router();
const fileUpload = require("../../utils/fileUpload");

const { upload } = fileUpload("documents");

const courseBooksController = require("./courseBooks.controller");

router.post("/list", courseBooksController.list);

router.post("/create", upload.single("ebook"), (req, res) => {
	if (req.role == "Administrator") {
		courseBooksController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", upload.single("ebook"), (req, res) => {
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
