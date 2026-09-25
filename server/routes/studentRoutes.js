const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/students/me - Protected route to pull self profile parameters
router.get("/me", authMiddleware, studentController.getStudentProfile);

module.exports = router;
