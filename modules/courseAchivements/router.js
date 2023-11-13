const express = require("express");
const router = express.Router();
const courseAchivementsController = require("./courseAchivements.controller");

router.post("/list", (req, res) => {
	if (req.role == "User") {
		courseAchivementsController.listByUser(req, res);
	} else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

module.exports = router;
