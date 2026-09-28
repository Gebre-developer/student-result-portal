// server/routes/resultRoutes.js
const express = require("express");
const router = express.Router();

// 1. Import your working authentication middleware token parser
const authMiddleware = require("../middleware/authMiddleware");

// 2. Import your GPA and score calculations controller matrix
const resultController = require("../controllers/resultController");

// 🚀 FIXED PATH MATCH: Listens directly to GET /results/my-grades
// The authMiddleware securely parses the payload into req.user first
router.get("/my-grades", authMiddleware, resultController.getMyResults);

// Export the router pipeline configuration safely for server.js to use
module.exports = router;
