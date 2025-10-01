const express = require("express");
const router = express.Router();
const SubCategoryController = require("../controllers/SubCategoryController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.get("/", SubCategoryController.getAllSubCategories);
router.get("/:id", SubCategoryController.getSubCategoryById);

// Protected routes (admin only)
router.post("/", authenticateToken, isAdmin, SubCategoryController.createSubCategory);
router.put("/:id", authenticateToken, isAdmin, SubCategoryController.updateSubCategory);
router.delete("/:id", authenticateToken, isAdmin, SubCategoryController.deleteSubCategory);

module.exports = router; 