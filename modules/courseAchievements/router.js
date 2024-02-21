const express = require("express");
const router = express.Router();
const courseAchievementsController = require("./courseAchievements.controller");

router.post("/list", (req, res) => {
	if (req.role == "User") {
		courseAchievementsController.list(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
