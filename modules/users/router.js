"use strict";
const usersController = require("./user.controller");
const express = require("express");
const router = express.Router();

const fileUpload = require("../../utils/fileUpload");
const { upload } = fileUpload("users");

router.post("/list", (req, res) => {
	if (req.role == "Administrator") {
		usersController.listUsers(req, res);
	} else if (req.role == "Client") {
		usersController.listUsersForClient(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list/departments", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usersController.listDepartments(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list/designations", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usersController.listDesignations(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		usersController.create(req, res);
	} else if (req.role == "Client") {
		usersController.createByClient(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", usersController.detail);
router.post("/update", usersController.update);
router.post("/update/image", upload.single("image"), usersController.updateImage);

router.post("/change-password", usersController.changePassword);

router.post("/delete", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		usersController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
