const BaseController = require("./BaseController.js");
const ProgressRepo = require("../repos/ProgressRepo.js");
const EnrollmentRepo = require("../repos/EnrollmentRepo.js");
const SubCategoryRepo = require("../repos/SubCategoryRepo.js");
const SubjectRepo = require("../repos/SubjectRepo.js");
const ChapterRepo = require("../repos/ChapterRepo.js");
const LessonRepo = require("../repos/LessonRepo.js");
const ProgressValidator = require("../validators/ProgressValidator.js");
const db = require("../models/index.js");

class ProgressController extends BaseController {
  constructor() {
    super();
  }

  // Get all progress records with pagination and filtering options
  getAllProgress = async (req, res) => {
    try {
      const { page = 1, limit = 10, enrollmentId, subcategoryId } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      if (enrollmentId) {
        const enrollment = await EnrollmentRepo.findEnrollment({
          where: { id: enrollmentId },
        });
        if (!enrollment) {
          return this.errorResponse(404, res, "Enrollment not found");
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
      if (enrollmentId) whereClause.enrollmentId = enrollmentId;
      if (subcategoryId) whereClause.subcategoryId = subcategoryId;

      const customQuery = {
        where: whereClause,
        ...pagination,
        include: [
          {
            model: db.Enrollment,
            as: "enrollment",
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
          },
        ],
        order: [["id", "ASC"]],
      };

      // Use Promise.all to fetch progress records and count in parallel
      const [progressRecords, totalRecords] = await Promise.all([
        ProgressRepo.findAllProgress(customQuery),
        ProgressRepo.model.count({ where: whereClause }),
      ]);

      if (progressRecords.length === 0) {
        return this.errorResponse(404, res, "No progress records found");
      }

      const totalPages = Math.ceil(totalRecords / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        progressRecords,
        pagination: {
          totalRecords,
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
        "Progress records retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching progress records:", error);
      return this.serverErrorResponse(
        res,
        "Failed to retrieve progress records"
      );
    }
  };

  // Get progress by ID
  getProgressById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid progress ID is required"
        );
      }

      const progress = await ProgressRepo.findProgress({
        where: { id },
        include: [
          {
            model: db.Enrollment,
            as: "enrollment",
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
          },
        ],
      });

      if (!progress) {
        return this.errorResponse(404, res, "Progress not found");
      }

      return this.successResponse(
        200,
        res,
        progress,
        "Progress retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching progress:", error);
      return this.serverErrorResponse(res, "Failed to retrieve progress");
    }
  };

  // Get progress by enrollment ID
  getProgressByEnrollment = async (req, res) => {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId || isNaN(enrollmentId)) {
        return this.validationErrorResponse(
          res,
          "Valid enrollment ID is required"
        );
      }

      // Check if enrollment exists
      const enrollment = await EnrollmentRepo.findEnrollment({
        where: { id: enrollmentId },
      });

      if (!enrollment) {
        return this.errorResponse(404, res, "Enrollment not found");
      }

      const progress = await ProgressRepo.findProgress({
        where: { enrollmentId },
        include: [
          {
            model: db.Enrollment,
            as: "enrollment",
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
          },
        ],
      });

      if (!progress) {
        return this.errorResponse(
          404,
          res,
          "Progress not found for this enrollment"
        );
      }

      return this.successResponse(
        200,
        res,
        progress,
        "Progress retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching progress by enrollment:", error);
      return this.serverErrorResponse(res, "Failed to retrieve progress");
    }
  };

  // Get progress by student ID
  getProgressByStudent = async (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId || isNaN(studentId)) {
        return this.validationErrorResponse(
          res,
          "Valid student ID is required"
        );
      }

      // First get all enrollments for the student
      const enrollments = await EnrollmentRepo.findEnrollments({
        where: { studentId },
        attributes: ["id"],
      });

      if (enrollments.length === 0) {
        return this.errorResponse(
          404,
          res,
          "No enrollments found for this student"
        );
      }

      const enrollmentIds = enrollments.map((e) => e.id);

      // Now get all progress records for those enrollments
      const progressRecords = await ProgressRepo.findAllProgress({
        where: { enrollmentId: enrollmentIds },
        include: [
          {
            model: db.Enrollment,
            as: "enrollment",
            include: [
              {
                model: db.SubCategory,
                as: "subcategory",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (progressRecords.length === 0) {
        return this.errorResponse(
          404,
          res,
          "No progress records found for this student"
        );
      }

      return this.successResponse(
        200,
        res,
        progressRecords,
        "Student progress records retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching student progress:", error);
      return this.serverErrorResponse(
        res,
        "Failed to retrieve student progress"
      );
    }
  };

  // Update progress (full update)
  updateProgress = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid progress ID is required"
        );
      }

      const validationResult = ProgressValidator.validateUpdateProgress(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const progress = await ProgressRepo.findProgress({
        where: { id },
      });

      if (!progress) {
        return this.errorResponse(404, res, "Progress not found");
      }

      // Update progress with the validated data
      const updateQuery = {
        where: { id },
      };

      // Update last accessed time
      const updateData = {
        ...validationResult.data,
        lastAccessedAt: new Date(),
      };

      const updatedProgress = await ProgressRepo.updateProgress(
        updateData,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedProgress,
        "Progress updated successfully"
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      return this.serverErrorResponse(res, "Failed to update progress");
    }
  };

  // Update lesson progress
  updateLessonProgress = async (req, res) => {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId || isNaN(enrollmentId)) {
        return this.validationErrorResponse(
          res,
          "Valid enrollment ID is required"
        );
      }

      const validationResult = ProgressValidator.validateUpdateLessonProgress(
        req.body
      );

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { subjectId, chapterId, lessonId, status } = validationResult.data;

      // Verify all IDs exist
      const [subject, chapter, lesson, progress] = await Promise.all([
        SubjectRepo.findSubject({ where: { id: subjectId } }),
        ChapterRepo.findChapter({ where: { id: chapterId, subjectId } }),
        LessonRepo.findLesson({ where: { id: lessonId, chapterId } }),
        ProgressRepo.findProgress({ where: { enrollmentId } }),
      ]);

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      if (!chapter) {
        return this.errorResponse(
          404,
          res,
          "Chapter not found or does not belong to the specified subject"
        );
      }

      if (!lesson) {
        return this.errorResponse(
          404,
          res,
          "Lesson not found or does not belong to the specified chapter"
        );
      }

      if (!progress) {
        return this.errorResponse(
          404,
          res,
          "Progress not found for this enrollment"
        );
      }

      // Get the current progress data
      const progressData = progress.progress;

      // Update the specific lesson progress
      if (!progressData[subjectId]) {
        progressData[subjectId] = {};
      }

      if (!progressData[subjectId][chapterId]) {
        progressData[subjectId][chapterId] = {};
      }

      progressData[subjectId][chapterId][lessonId] = status;

      // Calculate overall completion percentage
      const completionPercentage = await this.calculateCompletionPercentage(
        progressData
      );

      // Update the progress record
      const updatedProgress = await ProgressRepo.updateProgress(
        {
          progress: progressData,
          completionPercentage,
          lastAccessedAt: new Date(),
        },
        { where: { enrollmentId } }
      );

      return this.successResponse(
        200,
        res,
        updatedProgress,
        "Lesson progress updated successfully"
      );
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      return this.serverErrorResponse(res, "Failed to update lesson progress");
    }
  };

  // Helper method to calculate completion percentage
  calculateCompletionPercentage = async (progressData) => {
    try {
      let totalLessons = 0;
      let completedLessons = 0;

      // Iterate through all subjects, chapters, and lessons
      for (const subjectId in progressData) {
        const subject = progressData[subjectId];
        for (const chapterId in subject) {
          const chapter = subject[chapterId];
          for (const lessonId in chapter) {
            totalLessons++;
            // Consider a lesson completed if its progress is 100
            if (chapter[lessonId] === 100) {
              completedLessons++;
            }
          }
        }
      }

      if (totalLessons === 0) {
        return 0;
      }

      return (completedLessons / totalLessons) * 100;
    } catch (error) {
      console.error("Error calculating completion percentage:", error);
      throw error;
    }
  };

  // Reset progress for an enrollment
  resetProgress = async (req, res) => {
    try {
      const { enrollmentId } = req.params;

      if (!enrollmentId || isNaN(enrollmentId)) {
        return this.validationErrorResponse(
          res,
          "Valid enrollment ID is required"
        );
      }

      // Check if enrollment exists
      const enrollment = await EnrollmentRepo.findEnrollment({
        where: { id: enrollmentId },
        include: [
          {
            model: db.Progress,
            as: "progress",
          },
        ],
      });

      if (!enrollment) {
        return this.errorResponse(404, res, "Enrollment not found");
      }

      if (!enrollment.progress) {
        return this.errorResponse(
          404,
          res,
          "Progress not found for this enrollment"
        );
      }

      // Generate new progress structure
      const progressData = await this.generateProgressStructure(
        enrollment.subcategoryId
      );

      // Update progress with resetted data
      const updatedProgress = await ProgressRepo.updateProgress(
        {
          progress: progressData,
          completionPercentage: 0,
          lastAccessedAt: new Date(),
        },
        { where: { enrollmentId } }
      );

      return this.successResponse(
        200,
        res,
        updatedProgress,
        "Progress reset successfully"
      );
    } catch (error) {
      console.error("Error resetting progress:", error);
      return this.serverErrorResponse(res, "Failed to reset progress");
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
}

module.exports = new ProgressController();
