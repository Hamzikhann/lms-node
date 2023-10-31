const express = require('express');
const router = express.Router();
const courseTaskAssessmentDetailController = require('./courseAssesmentDetail.controller');

router.post('/', courseTaskAssessmentDetailController.create);

router.put('/:id', courseTaskAssessmentDetailController.update);

router.delete('/:id', courseTaskAssessmentDetailController.delete);

router.get('/list/:CourseTaskAssessmentId', courseTaskAssessmentDetailController.list);

module.exports = router;
