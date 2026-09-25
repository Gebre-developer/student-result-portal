const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route configurations mappings
router.post("/activate", authController.activateAccount);
router.post("/login", authController.login); // 🚀 Add this line right here!

module.exports = router;
