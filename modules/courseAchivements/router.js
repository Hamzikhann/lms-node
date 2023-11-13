const express = require("express");
const router = express.Router();
const courseAchivementsController = require("./courseAchivements.controller");

router.post("/list", (req, res) => {
	console.log(req.role, req.body.courseId);
	if (req.role == "User" && !req.body.courseId) {
		courseAchivementsController.listByUser(req, res);
	} else if (req.role == "User" && req.body.courseId) {
		courseAchivementsController.listByCourse(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
