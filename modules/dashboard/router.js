"use strict";

const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");

router.post("/asd", dashboardController.findAllforAdministrator);

module.exports = router;
