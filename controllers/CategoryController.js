const BaseController = require("./BaseController.js");
const CategoryRepo = require("../repos/CategoryRepo.js");
const CategoryValidator = require("../validators/CategoryValidator.js");

class CategoryController extends BaseController {
  constructor() {
    super();
  }

  // Get all categories
  getAllCategories = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };
      const customQuery = {
        where: {},
        ...pagination,
      };
      const categories = await CategoryRepo.findCategories(customQuery);
      const totalCategories = await CategoryRepo.count();
      const totalPages = Math.ceil(totalCategories / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        categories,
        pagination: {
          totalCategories,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      };
      if (categories.length === 0) {
        return this.errorResponse(404, res, "No categories found");
      }

      return this.successResponse(
        200,
        res,
        response,
        "Categories retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      return this.serverErrorResponse(res, "Failed to retrieve categories");
    }
  };

  // Get category by ID
  getCategoryById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid category ID is required"
        );
      }

      const category = await CategoryRepo.findCategory({ where: { id } });

      if (!category) {
        return this.errorResponse(404, res, "Category not found");
      }

      return this.successResponse(
        200,
        res,
        category,
        "Category retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching category:", error);
      return this.serverErrorResponse(res, "Failed to retrieve category");
    }
  };

  // Create new category
  createCategory = async (req, res) => {
    try {
      const validationResult = CategoryValidator.validateCreateCategory(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { name, imageUrl } = validationResult.data;

      // Check if category with same name already exists
      const existingCategory = await CategoryRepo.findCategory({
        where: { name },
      });

      if (existingCategory) {
        return this.errorResponse(
          409,
          res,
          "Category with this name already exists"
        );
      }

      const category = await CategoryRepo.createCategory({ name, imageUrl });

      return this.successResponse(
        201,
        res,
        category,
        "Category created successfully"
      );
    } catch (error) {
      console.error("Error creating category:", error);
      return this.serverErrorResponse(res, "Failed to create category");
    }
  };

  // Update category
  updateCategory = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid category ID is required"
        );
      }

      const validationResult = CategoryValidator.validateUpdateCategory(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const category = await CategoryRepo.findCategory({ where: { id } });

      if (!category) {
        return this.errorResponse(404, res, "Category not found");
      }

      // If name is being updated, check for duplicates
      if (
        validationResult.data.name &&
        validationResult.data.name !== category.name
      ) {
        const existingCategory = await CategoryRepo.findCategory({
          where: { name: validationResult.data.name },
        });

        if (existingCategory && existingCategory.id !== parseInt(id)) {
          return this.errorResponse(
            409,
            res,
            "Category with this name already exists"
          );
        }
      }

      const updateQuery = {
        where: { id },
      };

      const updatedCategory = await CategoryRepo.updateCategory(
        validationResult.data,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedCategory,
        "Category updated successfully"
      );
    } catch (error) {
      console.error("Error updating category:", error);
      return this.serverErrorResponse(res, "Failed to update category");
    }
  };

  // Delete category
  deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid category ID is required"
        );
      }

      const category = await CategoryRepo.findCategory({ where: { id } });

      if (!category) {
        return this.errorResponse(404, res, "Category not found");
      }

      const deleteQuery = {
        where: { id },
      };

      await CategoryRepo.deleteCategory(deleteQuery);

      return this.successResponse(
        200,
        res,
        null,
        "Category deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      return this.serverErrorResponse(res, "Failed to delete category");
    }
  };
}

module.exports = new CategoryController();
