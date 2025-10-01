const BaseController = require("./BaseController.js");
const SubjectRepo = require("../repos/SubjectRepo.js");
const SubCategoryRepo = require("../repos/SubCategoryRepo.js");
const UserRepo = require("../repos/UserRepo.js");
const SubjectValidator = require("../validators/SubjectValidator.js");
const db = require("../models/index.js");

class SubjectController extends BaseController {
  constructor() {
    super();
  }

  // Get all subjects with pagination and filtering options
  getAllSubjects = async (req, res) => {
    try {
      const { page = 1, limit = 10, subcategoryId, instructorId } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const whereClause = {};
      if (subcategoryId) {
        whereClause.subcategoryId = subcategoryId;
      }
      if (instructorId) {
        whereClause.instructorId = instructorId;
      }

      const customQuery = {
        where: whereClause,
        ...pagination,
        include: [
          {
            model: db.SubCategory,
            attributes: ["id", "name"],
            include: [
              {
                model: db.Category,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: db.User,
            as: "instructor",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      };

      const [subjects, totalSubjects] = await Promise.all([
        SubjectRepo.findSubjects(customQuery),
        SubjectRepo.count(whereClause),
      ]);

      if (subjects.length === 0) {
        return this.errorResponse(404, res, "No subjects found");
      }

      const totalPages = Math.ceil(totalSubjects / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        subjects,
        pagination: {
          totalSubjects,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      };

      return this.successResponse(
        200,
        res,
        response,
        "Subjects retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subjects");
    }
  };

  // Get subject by ID
  getSubjectById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid subject ID is required"
        );
      }

      const customQuery = {
        where: { id },
        include: [
          {
            model: db.SubCategory,
            attributes: ["id", "name"],
            include: [
              {
                model: db.Category,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: db.User,
            as: "instructor",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      };

      const subject = await SubjectRepo.findSubject(customQuery);

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      return this.successResponse(
        200,
        res,
        subject,
        "Subject retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subject:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subject");
    }
  };

  // Create new subject
  createSubject = async (req, res) => {
    try {
      const validationResult = SubjectValidator.validateCreateSubject(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { name, subcategoryId, instructorId, description, imageUrl, rating } =
        validationResult.data;

      // Parallel checks for subcategory and instructor if they are provided
      const checks = [];
      let subcategory, instructor;

      if (subcategoryId) {
        checks.push(
          SubCategoryRepo.findSubCategory({
            where: { id: subcategoryId },
          }).then((result) => (subcategory = result))
        );
      }

      if (instructorId) {
        checks.push(
          UserRepo.findOne({
            where: { id: instructorId },
          }).then((result) => (instructor = result))
        );
      }

      // Wait for all checks to complete
      await Promise.all(checks);

      // Validate results of checks
      if (subcategoryId && !subcategory) {
        return this.errorResponse(404, res, "Subcategory not found");
      }

      if (instructorId && !instructor) {
        return this.errorResponse(404, res, "Instructor not found");
      }

      // Check if subject with same name already exists in the same subcategory
      if (subcategoryId) {
        const existingSubject = await SubjectRepo.findSubject({
          where: { name, subcategoryId },
        });

        if (existingSubject) {
          return this.errorResponse(
            409,
            res,
            "Subject with this name already exists in this subcategory"
          );
        }
      }

      const subject = await SubjectRepo.createSubject({
        name,
        subcategoryId,
        instructorId,
        description,
        imageUrl: imageUrl || null,
        rating,
      });

      return this.successResponse(
        201,
        res,
        subject,
        "Subject created successfully"
      );
    } catch (error) {
      console.error("Error creating subject:", error);
      return this.serverErrorResponse(res, "Failed to create subject");
    }
  };

  // Update subject
  updateSubject = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid subject ID is required"
        );
      }

      const validationResult = SubjectValidator.validateUpdateSubject(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const subject = await SubjectRepo.findSubject({
        where: { id },
      });

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      // Parallel checks for subcategory and instructor if they are provided in request body
      const checks = [];
      let subcategory, instructor;

      if (validationResult.data.subcategoryId) {
        checks.push(
          SubCategoryRepo.findSubCategory({
            where: { id: validationResult.data.subcategoryId },
          }).then((result) => (subcategory = result))
        );
      }

      if (validationResult.data.instructorId) {
        checks.push(
          UserRepo.findOne({
            where: { id: validationResult.data.instructorId },
          }).then((result) => (instructor = result))
        );
      }

      // Wait for all checks to complete
      await Promise.all(checks);

      // Validate results of checks
      if (validationResult.data.subcategoryId && !subcategory) {
        return this.errorResponse(404, res, "Subcategory not found");
      }

      if (validationResult.data.instructorId && !instructor) {
        return this.errorResponse(404, res, "Instructor not found");
      }

      // If name is being updated, check for duplicates in the same subcategory
      if (
        validationResult.data.name &&
        (validationResult.data.name !== subject.name ||
          validationResult.data.subcategoryId !== subject.subcategoryId)
      ) {
        const subcategoryId =
          validationResult.data.subcategoryId || subject.subcategoryId;
        const existingSubject = await SubjectRepo.findSubject({
          where: { name: validationResult.data.name, subcategoryId },
        });

        if (existingSubject && existingSubject.id !== parseInt(id)) {
          return this.errorResponse(
            409,
            res,
            "Subject with this name already exists in this subcategory"
          );
        }
      }

      const updateQuery = {
        where: { id },
      };

      const updatedSubject = await SubjectRepo.updateSubject(
        validationResult.data,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedSubject,
        "Subject updated successfully"
      );
    } catch (error) {
      console.error("Error updating subject:", error);
      return this.serverErrorResponse(res, "Failed to update subject");
    }
  };

  // Delete subject
  deleteSubject = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid subject ID is required"
        );
      }

      const subject = await SubjectRepo.findSubject({
        where: { id },
      });

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      await SubjectRepo.deleteSubject({ where: { id } });

      return this.successResponse(
        200,
        res,
        null,
        "Subject deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting subject:", error);
      return this.serverErrorResponse(res, "Failed to delete subject");
    }
  };
}

module.exports = new SubjectController();
