const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// Protected routes (admin only)
router.post("/", authenticateToken, isAdmin, CategoryController.createCategory);
router.put("/:id", authenticateToken, isAdmin, CategoryController.updateCategory);
router.delete("/:id", authenticateToken, isAdmin, CategoryController.deleteCategory);

module.exports = router;
