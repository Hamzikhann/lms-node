
'use strict';
const learningController = require("./learningPaths.controller");
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    if (req.role == 'Administrator') {
        learningController.findAll(req, res);
    } else {
        res.status(403).send({ message: 'Forbidden Access' });
    }
});
router.post('/', (req, res) => {
    if (req.role == 'Administrator') {
        learningController.create(req, res);
    } else {
        res.status(403).send({ message: 'Forbidden Access' });
    }
});

module.exports = router;

