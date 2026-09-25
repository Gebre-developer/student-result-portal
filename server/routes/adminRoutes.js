const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Protection and File processing gateway handlers
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware"); // 🚀 Import Multer

// POST /api/admin/students/upload - Handle spreadsheet parsing
router.post(
  "/students/upload",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("file"), // 'file' matches the field name we will send in Postman or React FormData
  adminController.bulkImportStudents,
);

module.exports = router;
