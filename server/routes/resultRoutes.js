// server/routes/resultRoutes.js
const express = require("express");
const router = express.Router();

// 💡 FIXED: Import 'getStudentGrades' from your active studentController file
const { getStudentGrades } = require("../controllers/studentController");

// 💡 FIXED: Keep your authentication middleware to protect student routes
const { protect } = require("../middleware/authMiddleware");

// Secure GET routing pipeline mapping architecture link matching
// 💡 FIXED: Changed path from "/my-results" to "/" so it perfectly handles GET /api/results
router.get("/", protect, getStudentGrades);

module.exports = router;
