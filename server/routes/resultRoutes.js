// server/routes/resultRoutes.js
const express = require("express");
const router = express.Router();

// 💡 FIX 1: Ensure you import using matching destructured curly brackets
const { getMyResults } = require("../controllers/resultController");

// 💡 FIX 2: Ensure your middleware import matches its export structure exactly
const { protect } = require("../middleware/authMiddleware");

// Secure GET routing pipeline mapping architecture link matching
// Ensure 'protect' and 'getMyResults' are fully defined functions!
router.get("/my-results", protect, getMyResults);

module.exports = router;
