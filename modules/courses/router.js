"use strict";
const courseController = require("./course.controller");
const express = require("express");
const router = express.Router();

router.post("/create", (req, res) => {
	if (req.role == "Administrator") {
		courseController.create(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/list", (req, res) => {
	if (req.role == "Administrator" || req.role == "Client") {
		courseController.findAllCourses(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/enroll", (req, res) => {
	if (req.role == "Administrator") {
		courseController.courseEnrollmeent(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.post("/detail", (req, res) => {
	courseController.findCourseById(req, res);
});

router.put("/:courseId", (req, res) => {
	if (req.role == "Admin") {
		courseController.update(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.delete("/:courseId", (req, res) => {
	if (req.role == "Admin") {
		courseController.delete(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
module.exports = router;

// router.get('/', (req, res) => {
//     if (req.role == 'Admin' || req.role == 'Editor') {
//         classesController.findAllClasses(req, res);
//     } else if (req.role == 'Teacher') {
//         classesController.findAllForTeacher(req, res);
//     } else {
//         res.status(403).send({ message: 'Forbidden Access' });
//     }
// });
