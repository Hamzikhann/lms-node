const express = require("express");
const router = express.Router();
const courseAchivementsController = require("./courseAchivements.controller");

router.post("/list", (req, res) => {
	if (req.role == "User" && !req.body.coureseId) {
		courseAchivementsController.listByUser(req, res);
	} else if (req.role == "User" && req.body.coureseId) {
		courseAchivementsController.listByCourse(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
