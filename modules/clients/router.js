"use strict";

const clientController = require("./clients.controller");

const express = require("express");
const router = express.Router();
const fileUpload = require("../../utils/fileUpload");
const { upload } = fileUpload("clients");

router.post("/list", upload.single("client"), (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
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

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		clientController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		clientController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.post("/updateImage", upload.single("image"), clientController.updateImage);

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		clientController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
