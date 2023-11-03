const express = require("express");
const router = express.Router();
const courseAssesmentQuestionController = require("./courseAssessmentQuestion.controller");

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseAssesmentQuestionController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/update", (req, res) => {
	if (req.role == "Administrator") {
		courseAssesmentQuestionController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/delete", (req, res) => {
	if (req.role == "Administrator") {
		courseAssesmentQuestionController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
