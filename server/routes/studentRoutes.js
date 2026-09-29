// server/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// 💡 FIX: Destructure the controller methods cleanly
const {
  getStudentProfile,
  getStudentGrades,
} = require("../controllers/studentController");

// 💡 FIX: Destructure the protection middleware from your authMiddleware file
const { protect } = require("../middleware/authMiddleware");

// Route configurations mapping context matching pipelines
// Ensure 'protect', 'getStudentProfile', and 'getStudentGrades' are completely defined functions!
router.get("/me", protect, getStudentProfile);
router.get("/grades", protect, getStudentGrades);

module.exports = router;
