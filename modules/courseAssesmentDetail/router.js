const express = require('express');
const router = express.Router();
const courseTaskAssessmentDetailController = require('./courseAssesmentDetail.controller');

router.post('/create', courseTaskAssessmentDetailController.create);

router.put('/update', courseTaskAssessmentDetailController.update);

router.delete('/delete', courseTaskAssessmentDetailController.delete);

router.get('/list', courseTaskAssessmentDetailController.list);

module.exports = router;
