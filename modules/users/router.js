"use strict";
const usersController = require("./user.controller");
const express = require("express");
const router = express.Router();

const fileUpload = require("../../utils/fileUpload");
const { upload } = fileUpload("user");

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		usersController.list(req, res);
	} else if (req.role == "Client") {
		usersController.listForClient(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/create", upload.single("image"), (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usersController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", usersController.detail);
router.post("/update", usersController.update);
router.post("/change-password", usersController.changePassword);

router.post("/delete", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usersController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
