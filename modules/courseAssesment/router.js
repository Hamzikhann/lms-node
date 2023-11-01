const express = require("express");
const router = express.Router();
const courseTaskAssessmentController = require("./courseAssesment.controller");

router.post("/create", courseTaskAssessmentController.create);

router.post("/update", courseTaskAssessmentController.update);

router.post("/delete", courseTaskAssessmentController.delete);

router.post("/detail", courseTaskAssessmentController.detail);

module.exports = router;
