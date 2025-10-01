const BaseController = require("./BaseController.js");
const ChapterRepo = require("../repos/ChapterRepo.js");
const SubjectRepo = require("../repos/SubjectRepo.js");
const ChapterValidator = require("../validators/ChapterValidator.js");
const db = require("../models/index.js");

class ChapterController extends BaseController {
  constructor() {
    super();
  }

  // Get all chapters with pagination and filtering options
  getAllChapters = async (req, res) => {
    try {
      const { page = 1, limit = 10, subjectId, subcategoryId } = req.query;
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      let whereClause = {};
      let includeOptions = [];
      
      // If subjectId is provided, filter chapters directly
      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Setup include options for Subject with SubCategory
      includeOptions = [
        {
          model: db.Subject,
          attributes: ["id", "name"],
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
          ],
        },
      ];

      // If subcategoryId is provided, we need to filter subjects by subcategoryId
      if (subcategoryId) {
        // Set up a special query to filter by subcategoryId
        includeOptions = [
          {
            model: db.Subject,
            attributes: ["id", "name"],
            required: true, // This makes it an INNER JOIN
            where: { subcategoryId: subcategoryId }, // Filter subjects by subcategoryId
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
            ],
          },
        ];
      }

      const customQuery = {
        where: whereClause,
        ...pagination,
        include: includeOptions,
        order: [['id', 'ASC']]
      };

      // For count, we need a more complex query when filtering by subcategoryId
      let countWhereClause = whereClause;
      let countIncludeOptions = null;
      
      if (subcategoryId) {
        countIncludeOptions = [
          {
            model: db.Subject,
            required: true,
            where: { subcategoryId: subcategoryId },
            attributes: [] // Don't need to select columns, just need the join
          }
        ];
      }

      // Use Promise.all to fetch chapters and count in parallel
      const [chapters, totalChapters] = await Promise.all([
        ChapterRepo.findChapters(customQuery),
        subcategoryId 
          ? ChapterRepo.model.count({ where: countWhereClause, include: countIncludeOptions })
          : ChapterRepo.count(countWhereClause)
      ]);

      if (chapters.length === 0) {
        return this.errorResponse(404, res, "No chapters found");
      }

      const totalPages = Math.ceil(totalChapters / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        chapters,
        pagination: {
          totalChapters,
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
        "Chapters retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return this.serverErrorResponse(res, "Failed to retrieve chapters");
    }
  };

  // Get chapter by ID
  getChapterById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid chapter ID is required"
        );
      }

      const customQuery = {
        where: { id },
        include: [
          {
            model: db.Subject,
            attributes: ["id", "name"],
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
            ],
          },
        ],
      };

      const chapter = await ChapterRepo.findChapter(customQuery);

      if (!chapter) {
        return this.errorResponse(404, res, "Chapter not found");
      }

      return this.successResponse(
        200,
        res,
        chapter,
        "Chapter retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return this.serverErrorResponse(res, "Failed to retrieve chapter");
    }
  };

  // Create new chapter
  createChapter = async (req, res) => {
    try {
      const validationResult = ChapterValidator.validateCreateChapter(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { title, subjectId, description, duration, imageUrl } = validationResult.data;

      // Check if subject exists
      if (subjectId) {
        const subject = await SubjectRepo.findSubject({
          where: { id: subjectId },
        });

        if (!subject) {
          return this.errorResponse(404, res, "Subject not found");
        }
      }

      // Check if chapter with same title already exists for the same subject
      const existingChapter = await ChapterRepo.findChapter({
        where: { title, subjectId },
      });

      if (existingChapter) {
        return this.errorResponse(
          409,
          res,
          "Chapter with this title already exists for this subject"
        );
      }

      const chapter = await ChapterRepo.createChapter({
        title,
        subjectId,
        description,
        duration,
        imageUrl: imageUrl || null
      });

      return this.successResponse(
        201,
        res,
        chapter,
        "Chapter created successfully"
      );
    } catch (error) {
      console.error("Error creating chapter:", error);
      return this.serverErrorResponse(res, "Failed to create chapter");
    }
  };

  // Update chapter
  updateChapter = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid chapter ID is required"
        );
      }

      const validationResult = ChapterValidator.validateUpdateChapter(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const chapter = await ChapterRepo.findChapter({
        where: { id },
      });

      if (!chapter) {
        return this.errorResponse(404, res, "Chapter not found");
      }

      // If subjectId is being updated, check if subject exists
      if (validationResult.data.subjectId) {
        const subject = await SubjectRepo.findSubject({
          where: { id: validationResult.data.subjectId },
        });

        if (!subject) {
          return this.errorResponse(404, res, "Subject not found");
        }
      }

      // If title is being updated, check for duplicates for the same subject
      if (
        validationResult.data.title &&
        (validationResult.data.title !== chapter.title ||
          validationResult.data.subjectId !== chapter.subjectId)
      ) {
        const subjectId =
          validationResult.data.subjectId || chapter.subjectId;
        const existingChapter = await ChapterRepo.findChapter({
          where: { title: validationResult.data.title, subjectId },
        });

        if (existingChapter && existingChapter.id !== parseInt(id)) {
          return this.errorResponse(
            409,
            res,
            "Chapter with this title already exists for this subject"
          );
        }
      }

      const updateQuery = {
        where: { id },
      };

      const updatedChapter = await ChapterRepo.updateChapter(
        validationResult.data,
        updateQuery
      );

      return this.successResponse(
        200,
        res,
        updatedChapter,
        "Chapter updated successfully"
      );
    } catch (error) {
      console.error("Error updating chapter:", error);
      return this.serverErrorResponse(res, "Failed to update chapter");
    }
  };

  // Delete chapter
  deleteChapter = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid chapter ID is required"
        );
      }

      const chapter = await ChapterRepo.findChapter({
        where: { id },
      });

      if (!chapter) {
        return this.errorResponse(404, res, "Chapter not found");
      }

      await ChapterRepo.deleteChapter({ where: { id } });

      return this.successResponse(
        200,
        res,
        null,
        "Chapter deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting chapter:", error);
      return this.serverErrorResponse(res, "Failed to delete chapter");
    }
  };
}

module.exports = new ChapterController(); 