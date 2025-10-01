const express = require("express");
const router = express.Router();
const S3Controller = require("../controllers/S3Controller.js");
const authenticateToken = require("../middlewares/auth.middleware");

// Protected routes (authenticated users only)
router.get("/upload-url", authenticateToken, S3Controller.getSignedUrl);
router.get("/download-url", authenticateToken, S3Controller.getDownloadUrl);

module.exports = router; 