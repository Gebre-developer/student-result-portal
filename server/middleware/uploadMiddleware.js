const multer = require("multer");

// Configure memory storage to keep files in memory buffer before parsing
const storage = multer.memoryStorage();

// Ensure only CSV spreadsheet file types are allowed to pass through the filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only .csv spreadsheet files are allowed!",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB maximum
});

module.exports = upload;
