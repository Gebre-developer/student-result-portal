// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

// ✅ FIXED: Explicitly destructured imports ensure variables are loaded as valid functions
const { bulkUploadGrades } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Secure POST routing pipeline mapping architecture link matching
router.post("/bulk-upload-grades", protect, bulkUploadGrades);

module.exports = router;
