"use strict";
const usersController = require("./user.controller");
const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
	if (req.role == "Administrator" || req.role=="Client") {
		usersController.create(req, res);
    }
    else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});
router.get("/", (req, res) => {
    // usersController.findAllUsers(req, res);
    console.log(req)
	if (req.role == "Administrator") {
		usersController.findAllUsers(req, res);
	}
    else if(req.role == "Administrator"){
        usersController.findAllClientUsers(req,res)
    }
    else {
		res.status(403).send({ message: "Forbidden Access" });
	}
});

router.get("/:userId", (req, res) => {
    usersController.findUserById(req, res);
});

router.put("/:userId", (req, res) => {
    if (req.role == "Admin") {
        usersController.update(req, res);
    } else {
        res.status(403).send({ message: "Forbidden Access" });
    }
});

router.put("/profile/edit", (req, res) => {
    usersController.updateProfile(req, res);
});
router.put("/reset/password", (req, res) => {
    usersController.resetPassword(req, res);
});
router.delete("/:userId", (req, res) => {
    if (req.role == "Admin") {
        usersController.delete(req, res);
    } else {
        res.status(403).send({ message: "Forbidden Access" });
    }
});

// router.get("/assessment/:quizId", (req, res) => {
// 	if (req.role == "Teacher") {
// 		usersController.findAllStudentsForAssessment(req, res);
// 	} else {
// 		res.status(403).send({ message: "Forbidden Access" });
// 	}
// });
// router.get("/course/:courseId", (req, res) => {
// 	if (req.role == "Teacher") {
// 		usersController.findAllUsersEnrolledInCourse(req, res);
// 	} else {
// 		res.status(403).send({ message: "Forbidden Access" });
// 	}
// });


module.exports = router;
