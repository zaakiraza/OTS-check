const BaseController = require("./BaseController.js");
const LessonRepo = require("../repos/LessonRepo.js");
const ChapterRepo = require("../repos/ChapterRepo.js");
const LessonValidator = require("../validators/LessonValidator.js");
const db = require("../models/index.js");

class LessonController extends BaseController {
  constructor() {
    super();
  }

  // Get all lessons with pagination and filtering options
  getAllLessons = async (req, res) => {
    try {
      const { page = 1, limit = 10, chapterId } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const whereClause = {};
      if (chapterId) {
        whereClause.chapterId = chapterId;
      }

      const customQuery = {
        where: whereClause,
        ...pagination,
        include: [
          {
            model: db.Chapter,
            attributes: ["id", "title"],
            include: [
              {
                model: db.Subject,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [['id', 'ASC']]
      };

      // Use Promise.all to fetch lessons and count in parallel
      const [lessons, totalLessons] = await Promise.all([
        LessonRepo.findLessons(customQuery),
        LessonRepo.count(whereClause),
      ]);

      if (lessons.length === 0) {
        return this.errorResponse(404, res, "No lessons found");
      }

      const totalPages = Math.ceil(totalLessons / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        lessons,
        pagination: {
          totalLessons,
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
        "Lessons retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching lessons:", error);
      return this.serverErrorResponse(res, "Failed to retrieve lessons");
    }
  };

  // Get lesson by ID
  getLessonById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid lesson ID is required"
        );
      }

      const customQuery = {
        where: { id },
        include: [
          {
            model: db.Chapter,
            attributes: ["id", "title"],
            include: [
              {
                model: db.Subject,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      };

      const lesson = await LessonRepo.findLesson(customQuery);

      if (!lesson) {
        return this.errorResponse(404, res, "Lesson not found");
      }

      return this.successResponse(
        200,
        res,
        lesson,
        "Lesson retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return this.serverErrorResponse(res, "Failed to retrieve lesson");
    }
  };

  // Create new lesson
  createLesson = async (req, res) => {
    try {
      const validationResult = LessonValidator.validateCreateLesson(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { title, chapterId, description, duration, contentUrl, videoUrls } = validationResult.data;

      // Check if chapter exists
      if (chapterId) {
        const chapter = await ChapterRepo.findChapter({
          where: { id: chapterId },
        });

        if (!chapter) {
          return this.errorResponse(404, res, "Chapter not found");
        }
      }

      // Check if lesson with same title already exists for the same chapter
      const existingLesson = await LessonRepo.findLesson({
        where: { title, chapterId },
      });

      if (existingLesson) {
        return this.errorResponse(
          409,
          res,
          "Lesson with this title already exists for this chapter"
        );
      }

      const lesson = await LessonRepo.createLesson({
        title,
        chapterId,
        description,
        duration,
        contentUrl: contentUrl || null,
        videoUrls: videoUrls || []
      });

      return this.successResponse(
        201,
        res,
        lesson,
        "Lesson created successfully"
      );
    } catch (error) {
      console.error("Error creating lesson:", error);
      return this.serverErrorResponse(res, "Failed to create lesson");
    }
  };

  // Update lesson
  updateLesson = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid lesson ID is required"
        );
      }

      const validationResult = LessonValidator.validateUpdateLesson(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const lesson = await LessonRepo.findLesson({
        where: { id },
      });

      if (!lesson) {
        return this.errorResponse(404, res, "Lesson not found");
      }

      // If chapterId is being updated, check if chapter exists
      if (validationResult.data.chapterId) {
        const chapter = await ChapterRepo.findChapter({
          where: { id: validationResult.data.chapterId },
        });

        if (!chapter) {
          return this.errorResponse(404, res, "Chapter not found");
        }
      }

      // If title is being updated, check for duplicates for the same chapter
      if (
        validationResult.data.title &&
        (validationResult.data.title !== lesson.title ||
          validationResult.data.chapterId !== lesson.chapterId)
      ) {
        const chapterId =
          validationResult.data.chapterId || lesson.chapterId;
        const existingLesson = await LessonRepo.findLesson({
          where: { title: validationResult.data.title, chapterId },
        });

        if (existingLesson && existingLesson.id !== parseInt(id)) {
          return this.errorResponse(
            409,
            res,
            "Lesson with this title already exists for this chapter"
          );
        }
      }

      const updateQuery = {
        where: { id },
      };

      const updatedLesson = await LessonRepo.updateLesson(
        validationResult.data,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedLesson,
        "Lesson updated successfully"
      );
    } catch (error) {
      console.error("Error updating lesson:", error);
      return this.serverErrorResponse(res, "Failed to update lesson");
    }
  };

  // Delete lesson
  deleteLesson = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid lesson ID is required"
        );
      }

      const lesson = await LessonRepo.findLesson({
        where: { id },
      });

      if (!lesson) {
        return this.errorResponse(404, res, "Lesson not found");
      }

      await LessonRepo.deleteLesson({ where: { id } });

      return this.successResponse(
        200,
        res,
        null,
        "Lesson deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting lesson:", error);
      return this.serverErrorResponse(res, "Failed to delete lesson");
    }
  };
}

module.exports = new LessonController(); 