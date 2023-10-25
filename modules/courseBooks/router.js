const courseBooksController = require("./courseBooks.controller");

const express = require("express");
const router = express.Router();

router.post("/create", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseBooksController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseBooksController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseBooksController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
