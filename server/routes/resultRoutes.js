const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/results/my-results - Protected endpoint to pull grades and GPA breakdowns safely
router.get("/my-results", authMiddleware, resultController.getMyResults);

module.exports = router;
