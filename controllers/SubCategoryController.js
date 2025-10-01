const BaseController = require("./BaseController.js");
const SubCategoryRepo = require("../repos/SubCategoryRepo.js");
const CategoryRepo = require("../repos/CategoryRepo.js");
const SubCategoryValidator = require("../validators/SubCategoryValidator.js");
const db = require("../models/index.js");

class SubCategoryController extends BaseController {
  constructor() {
    super();
  }

  // Get all subcategories
  getAllSubCategories = async (req, res) => {
    try {
      const { page = 1, limit = 10, categoryId } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const whereClause = {};
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }

      const customQuery = {
        where: whereClause,
        ...pagination,
        include: [
          {
            model: db.Category,
            attributes: ["id", "name"], // Include only the id and name of the category
          },
        ],
      };

      const subCategories = await SubCategoryRepo.findSubCategories(
        customQuery
      );
      const totalSubCategories = await SubCategoryRepo.count(whereClause);
      const totalPages = Math.ceil(totalSubCategories / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        subCategories,
        pagination: {
          totalSubCategories,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      };

      if (subCategories.length === 0) {
        return this.errorResponse(404, res, "No subcategories found");
      }

      return this.successResponse(
        200,
        res,
        response,
        "Subcategories retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subcategories");
    }
  };

  // Get subcategory by ID
  getSubCategoryById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid subcategory ID is required"
        );
      }

      const customQuery = {
        where: { id },
        include: [
          {
            model: db.Category,
            attributes: ["id", "name"], // Include only the id and name of the category
          },
        ],
      };

      const subCategory = await SubCategoryRepo.findSubCategory(customQuery);

      if (!subCategory) {
        return this.errorResponse(404, res, "Subcategory not found");
      }

      return this.successResponse(
        200,
        res,
        subCategory,
        "Subcategory retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subcategory:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subcategory");
    }
  };

  // Create new subcategory
  createSubCategory = async (req, res) => {
    try {
      const validationResult = SubCategoryValidator.validateCreateSubCategory(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { name, categoryId } = validationResult.data;

      // Check if category exists
      const category = await CategoryRepo.findCategory({
        where: { id: categoryId },
      });

      if (!category) {
        return this.errorResponse(404, res, "Category not found");
      }

      // Check if subcategory with same name already exists in the same category
      const existingSubCategory = await SubCategoryRepo.findSubCategory({
        where: { name, categoryId },
      });

      if (existingSubCategory) {
        return this.errorResponse(
          409,
          res,
          "Subcategory with this name already exists in this category"
        );
      }

      const subCategory = await SubCategoryRepo.createSubCategory({
        name,
        categoryId,
      });

      return this.successResponse(
        201,
        res,
        subCategory,
        "Subcategory created successfully"
      );
    } catch (error) {
      console.error("Error creating subcategory:", error);
      return this.serverErrorResponse(res, "Failed to create subcategory");
    }
  };

  // Update subcategory
  updateSubCategory = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid subcategory ID is required"
        );
      }

      const validationResult = SubCategoryValidator.validateUpdateSubCategory(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const subCategory = await SubCategoryRepo.findSubCategory({
        where: { id },
      });

      if (!subCategory) {
        return this.errorResponse(404, res, "Subcategory not found");
      }

      // If categoryId is being updated, check if category exists
      if (validationResult.data.categoryId) {
        const category = await CategoryRepo.findCategory({
          where: { id: validationResult.data.categoryId },
        });

        if (!category) {
          return this.errorResponse(404, res, "Category not found");
        }
      }

      // If name is being updated, check for duplicates in the same category
      if (
        validationResult.data.name &&
        (validationResult.data.name !== subCategory.name ||
          validationResult.data.categoryId !== subCategory.categoryId)
      ) {
        const categoryId =
          validationResult.data.categoryId || subCategory.categoryId;
        const existingSubCategory = await SubCategoryRepo.findSubCategory({
          where: { name: validationResult.data.name, categoryId },
        });

        if (existingSubCategory && existingSubCategory.id !== parseInt(id)) {
          return this.errorResponse(
            409,
            res,
            "Subcategory with this name already exists in this category"
          );
        }
      }

      const updateQuery = {
        where: { id },
      };

      const updatedSubCategory = await SubCategoryRepo.updateSubCategory(
        validationResult.data,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedSubCategory,
        "Subcategory updated successfully"
      );
    } catch (error) {
      console.error("Error updating subcategory:", error);
      return this.serverErrorResponse(res, "Failed to update subcategory");
    }
  };

  // Delete subcategory
  deleteSubCategory = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid subcategory ID is required"
        );
      }

      const subCategory = await SubCategoryRepo.findSubCategory({
        where: { id },
      });

      if (!subCategory) {
        return this.errorResponse(404, res, "Subcategory not found");
      }

      await SubCategoryRepo.deleteSubCategory({ where: { id } });

      return this.successResponse(
        200,
        res,
        null,
        "Subcategory deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      return this.serverErrorResponse(res, "Failed to delete subcategory");
    }
  };
}

module.exports = new SubCategoryController();
