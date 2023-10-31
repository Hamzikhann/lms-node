const express = require('express');
const router = express.Router();
const courseTaskAssessmentController = require('./courseAssesment.controller');

router.post('/', courseTaskAssessmentController.create);

router.put('/:id', courseTaskAssessmentController.update);

router.delete('/:id', courseTaskAssessmentController.delete);

router.get('/list/:courseTaskId', courseTaskAssessmentController.list);

module.exports = router;
