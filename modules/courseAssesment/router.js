const express = require('express');
const router = express.Router();
const courseTaskAssessmentController = require('./courseAssesment.controller');

router.post('/create', courseTaskAssessmentController.create);

router.put('/update', courseTaskAssessmentController.update);

router.delete('/delete', courseTaskAssessmentController.delete);

router.get('/detail', courseTaskAssessmentController.detail);

module.exports = router;
