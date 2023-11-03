const express = require("express");
const router = express.Router();
const courseTaskAssessmentController = require("./courseAssessment.controller");

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseTaskAssessmentController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseTaskAssessmentController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseTaskAssessmentController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", courseTaskAssessmentController.detail);

module.exports = router;
