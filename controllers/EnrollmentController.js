const BaseController = require("./BaseController.js");
const EnrollmentRepo = require("../repos/EnrollmentRepo.js");
const ProgressRepo = require("../repos/ProgressRepo.js");
const UserRepo = require("../repos/UserRepo.js");
const SubCategoryRepo = require("../repos/SubCategoryRepo.js");
const SubjectRepo = require("../repos/SubjectRepo.js");
const ChapterRepo = require("../repos/ChapterRepo.js");
const LessonRepo = require("../repos/LessonRepo.js");
const EnrollmentValidator = require("../validators/EnrollmentValidator.js");
const db = require("../models/index.js");

class EnrollmentController extends BaseController {
  constructor() {
    super();
  }

  // Get all enrollments with pagination and filtering options
  getAllEnrollments = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        studentId,
        subcategoryId,
        status,
      } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      // check if student and subcategory exists
      if (studentId) {
        const user = await UserRepo.findUser({
          where: { id: studentId },
        });

        if (!user) {
          return this.errorResponse(404, res, "Student not found");
        }
      }

      if (subcategoryId) {
        const subcategory = await SubCategoryRepo.findSubCategory({
          where: { id: subcategoryId },
        });
        if (!subcategory) {
          return this.errorResponse(404, res, "Subcategory not found");
        }
      }

      const whereClause = {};
      if (studentId) whereClause.studentId = studentId;
      if (subcategoryId) whereClause.subcategoryId = subcategoryId;
      if (status) whereClause.status = status;

      const customQuery = {
        where: whereClause,
        ...pagination,
        include: [
          {
            model: db.User,
            as: "student",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: db.SubCategory,
            as: "subcategory",
            attributes: ["id", "name"],
            include: [
              {
                model: db.Category,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: db.Progress,
            as: "progress",
            attributes: ["id", "completionPercentage", "lastAccessedAt"],
          },
        ],
        order: [["id", "ASC"]],
      };

      // Use Promise.all to fetch enrollments and count in parallel
      const [enrollments, totalEnrollments] = await Promise.all([
        EnrollmentRepo.findEnrollments(customQuery),
        EnrollmentRepo.count(whereClause),
      ]);

      if (enrollments.length === 0) {
        return this.errorResponse(404, res, "No enrollments found");
      }

      const totalPages = Math.ceil(totalEnrollments / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        enrollments,
        pagination: {
          totalEnrollments,
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
        "Enrollments retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      return this.serverErrorResponse(res, "Failed to retrieve enrollments");
    }
  };

  // Get enrollment by ID
  getEnrollmentById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid enrollment ID is required"
        );
      }

      const customQuery = {
        where: { id },
        include: [
          {
            model: db.User,
            as: "student",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: db.SubCategory,
            as: "subcategory",
            attributes: ["id", "name"],
            include: [
              {
                model: db.Category,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: db.Progress,
            as: "progress",
            attributes: ["id", "completionPercentage", "lastAccessedAt"],
          },
        ],
      };

      const enrollment = await EnrollmentRepo.findEnrollment(customQuery);

      if (!enrollment) {
        return this.errorResponse(404, res, "Enrollment not found");
      }

      return this.successResponse(
        200,
        res,
        enrollment,
        "Enrollment retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      return this.serverErrorResponse(res, "Failed to retrieve enrollment");
    }
  };

  // Create new enrollment - OPTIMIZED
  createEnrollment = async (req, res) => {
    // Start transaction outside of try block to ensure it's available in catch block
    let transaction;
    
    try {
      // Validate request body first before any DB operations
      const validationResult = EnrollmentValidator.validateCreateEnrollment(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { studentId, subcategoryId, status, enrollmentDate } =
        validationResult.data;
      
      // Start transaction only after validation succeeds
      transaction = await db.sequelize.transaction();
      
      // Run these queries in parallel to reduce wait time
      const [user, subcategory, existingEnrollment] = await Promise.all([
        // Check if user exists
        UserRepo.findUser({
          where: { id: studentId },
          attributes: ['id'], // Select only necessary fields
          raw: true // Get raw data for better performance
        }),
        
        // Check if subcategory exists
        SubCategoryRepo.findSubCategory({
          where: { id: subcategoryId },
          attributes: ['id'], // Select only necessary fields
          raw: true // Get raw data for better performance
        }),
        
        // Check if enrollment already exists
        EnrollmentRepo.findEnrollment({
          where: { studentId, subcategoryId },
          attributes: ['id'], // Select only necessary fields
          raw: true // Get raw data for better performance
        })
      ]);

      if (!user) {
        await transaction.rollback();
        return this.errorResponse(404, res, "Student not found");
      }

      if (!subcategory) {
        await transaction.rollback();
        return this.errorResponse(404, res, "Subcategory not found");
      }

      if (existingEnrollment) {
        await transaction.rollback();
        return this.errorResponse(
          409,
          res,
          "Student is already enrolled in this Class"
        );
      }

      // Create enrollment with only necessary fields
      const enrollment = await EnrollmentRepo.createEnrollment(
        {
          studentId,
          subcategoryId,
          status: status || "active",
          enrollmentDate: enrollmentDate || new Date(),
        },
        { transaction }
      );

      await transaction.commit();
      transaction = null; // Mark as committed

      // Fetch the created enrollment with its related data - using specific attributes to limit data
      const createdEnrollment = await EnrollmentRepo.findEnrollment({
        where: { id: enrollment.id },
        include: [
          {
            model: db.User,
            as: "student",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: db.SubCategory,
            as: "subcategory",
            attributes: ["id", "name"],
          },
        ],
      });

      return this.successResponse(
        201,
        res,
        createdEnrollment,
        "Enrollment created successfully"
      );
    } catch (error) {
      console.error("Error creating enrollment:", error);
      // Only rollback if transaction exists and is not already committed
      if (transaction) await transaction.rollback();
      return this.serverErrorResponse(res, "Failed to create enrollment");
    }
  };

  // Helper method to generate progress structure
  generateProgressStructure = async (subcategoryId) => {
    try {
      // Fetch all subjects for the subcategory
      const subjects = await SubjectRepo.findSubjects({
        where: { subcategoryId },
        attributes: ["id", "name"],
      });

      const progressStructure = {};

      // For each subject, fetch chapters
      for (const subject of subjects) {
        progressStructure[subject.id] = {};

        const chapters = await ChapterRepo.findChapters({
          where: { subjectId: subject.id },
          attributes: ["id", "title"],
        });

        // For each chapter, fetch lessons
        for (const chapter of chapters) {
          progressStructure[subject.id][chapter.id] = {};

          const lessons = await LessonRepo.findLessons({
            where: { chapterId: chapter.id },
            attributes: ["id", "title"],
          });

          // Add each lesson with initial progress value 0
          lessons.forEach((lesson) => {
            progressStructure[subject.id][chapter.id][lesson.id] = 0;
          });
        }
      }
      
      return progressStructure;
    } catch (error) {
      console.error("Error generating progress structure:", error);
      throw error;
    }
  };

  // Update enrollment
  updateEnrollment = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid enrollment ID is required"
        );
      }

      const validationResult = EnrollmentValidator.validateUpdateEnrollment(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const enrollment = await EnrollmentRepo.findEnrollment({
        where: { id },
      });

      if (!enrollment) {
        return this.errorResponse(404, res, "Enrollment not found");
      }

      const updateQuery = {
        where: { id },
      };

      const updatedEnrollment = await EnrollmentRepo.updateEnrollment(
        validationResult.data,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedEnrollment,
        "Enrollment updated successfully"
      );
    } catch (error) {
      console.error("Error updating enrollment:", error);
      return this.serverErrorResponse(res, "Failed to update enrollment");
    }
  };

  // Delete enrollment
  deleteEnrollment = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid enrollment ID is required"
        );
      }

      const enrollment = await EnrollmentRepo.findEnrollment({
        where: { id },
      });

      if (!enrollment) {
        return this.errorResponse(404, res, "Enrollment not found");
      }

      // Delete progress first (cascade should handle this, but doing it explicitly)
      await ProgressRepo.deleteProgress(
        {
          where: { enrollmentId: id },
        },
        { transaction }
      );

      // Delete enrollment
      await EnrollmentRepo.deleteEnrollment(
        {
          where: { id },
        },
        { transaction }
      );

      await transaction.commit();

      return this.successResponse(
        200,
        res,
        null,
        "Enrollment deleted successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting enrollment:", error);
      return this.serverErrorResponse(res, "Failed to delete enrollment");
    }
  };

  // Get enrollments by student
  getEnrollmentsByStudent = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // console.log(studentId);
      if (!studentId || isNaN(studentId)) {
        return this.validationErrorResponse(
          res,
          "Valid student ID is required"
        );
      }

      
      // Check if user exists
      const user = await UserRepo.findUser({
        where: { id: studentId },
      });

      // console.log(user);

      if (!user) {
        return this.errorResponse(404, res, "Student not found");
      }

      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const customQuery = {
        where: { studentId },
        ...pagination,
        include: [
          {
            model: db.SubCategory,
            as: "subcategory",
            attributes: ["id", "name"],
            include: [
              {
                model: db.Category,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: db.Progress,
            as: "progress",
            attributes: ["id", "completionPercentage", "lastAccessedAt"],
          },
        ],
        order: [["enrollmentDate", "DESC"]],
      };

      // Use Promise.all to fetch enrollments and count in parallel
      const [enrollments, totalEnrollments] = await Promise.all([
        EnrollmentRepo.findEnrollments(customQuery),
        EnrollmentRepo.count({ studentId }),
      ]);

      if (enrollments.length === 0) {
        return this.errorResponse(
          404,
          res,
          "No enrollments found for this student"
        );
      }

      const totalPages = Math.ceil(totalEnrollments / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        enrollments,
        pagination: {
          totalEnrollments,
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
        "Student enrollments retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      return this.serverErrorResponse(
        res,
        "Failed to retrieve student enrollments"
      );
    }
  };
}

module.exports = new EnrollmentController();
