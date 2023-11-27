"use strict";

const express = require("express");
const router = express.Router();
const transcriptController = require("./transcript.controller");

router.post("/update", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		transcriptController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
