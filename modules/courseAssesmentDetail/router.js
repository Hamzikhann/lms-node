const express = require("express");
const router = express.Router();
const courseTaskAssessmentDetailController = require("./courseAssesmentDetail.controller");

router.post("/create", courseTaskAssessmentDetailController.create);

router.post("/update", courseTaskAssessmentDetailController.update);

router.post("/delete", courseTaskAssessmentDetailController.delete);

router.post("/list", courseTaskAssessmentDetailController.list);

module.exports = router;
