const BaseController = require("./BaseController.js");
const LessonCommentRepo = require("../repos/LessonCommentRepo.js");
const LessonRepo = require("../repos/LessonRepo.js");
const UserRepo = require("../repos/UserRepo.js");
const LessonCommentValidator = require("../validators/LessonCommentValidator.js");
const db = require("../models/index.js");

class LessonCommentController extends BaseController {
  constructor() {
    super();
  }

  // Get all comments for a lesson
  getAllCommentsForLesson = async (req, res) => {
    try {
      const { lessonId } = req.params;
      
      if (!lessonId || isNaN(lessonId)) {
        return this.validationErrorResponse(
          res,
          "Valid lesson ID is required"
        );
      }

      // Check if lesson exists
      const lesson = await LessonRepo.findLesson({
        where: { id: lessonId },
      });

      if (!lesson) {
        return this.errorResponse(404, res, "Lesson not found");
      }

      // Find all top-level comments for this lesson
      const comments = await LessonCommentRepo.findComments({
        where: { 
          lessonId,
          parentId: null // Only get top-level comments
        },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username', 'imageUrl']
          },
          {
            model: db.LessonComment,
            as: 'replies',
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'username', 'imageUrl']
              }
            ]
          }
        ],
        order: [
          ['createdAt', 'DESC'],
          [{ model: db.LessonComment, as: 'replies' }, 'createdAt', 'ASC']
        ]
      });

      return this.successResponse(
        200,
        res,
        comments,
        "Comments retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
      return this.serverErrorResponse(res, "Failed to retrieve comments");
    }
  };

  // Get comment by ID
  getCommentById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid comment ID is required"
        );
      }

      const comment = await LessonCommentRepo.findComment({
        where: { id },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username', 'imageUrl']
          },
          {
            model: db.LessonComment,
            as: 'replies',
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'username', 'imageUrl']
              }
            ]
          }
        ]
      });

      if (!comment) {
        return this.errorResponse(404, res, "Comment not found");
      }

      return this.successResponse(
        200,
        res,
        comment,
        "Comment retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching comment:", error);
      return this.serverErrorResponse(res, "Failed to retrieve comment");
    }
  };

  // Create new comment
  createComment = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Add the authenticated user's ID to the request body
      req.body.userId = req.user.id;
      
      const validationResult = LessonCommentValidator.validateCreateComment(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { lessonId, userId, parentId, content } = validationResult.data;

      // Check if lesson exists
      const lesson = await LessonRepo.findLesson({
        where: { id: lessonId },
      });

      if (!lesson) {
        return this.errorResponse(404, res, "Lesson not found");
      }

      // If this is a reply, check if parent comment exists
      if (parentId) {
        const parentComment = await LessonCommentRepo.findComment({
          where: { id: parentId },
        });

        if (!parentComment) {
          return this.errorResponse(404, res, "Parent comment not found");
        }

        // Ensure parent comment is a top-level comment (not a reply)
        if (parentComment.parentId !== null) {
          return this.errorResponse(400, res, "Cannot reply to a reply. Only one level of nesting is allowed.");
        }
        
        // Ensure parent comment belongs to the same lesson
        if (parentComment.lessonId !== parseInt(lessonId)) {
          return this.errorResponse(400, res, "Parent comment does not belong to the specified lesson");
        }
      }

      const comment = await LessonCommentRepo.createComment({
        lessonId,
        userId,
        parentId,
        content
      }, { transaction });

      await transaction.commit();

      // Fetch the newly created comment with user data
      const newComment = await LessonCommentRepo.findComment({
        where: { id: comment.id },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username', 'imageUrl']
          }
        ]
      });

      return this.successResponse(
        201,
        res,
        newComment,
        "Comment created successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating comment:", error);
      return this.serverErrorResponse(res, "Failed to create comment");
    }
  };

  // Update comment
  updateComment = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid comment ID is required"
        );
      }

      const validationResult = LessonCommentValidator.validateUpdateComment(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const comment = await LessonCommentRepo.findComment({
        where: { id },
      });

      if (!comment) {
        return this.errorResponse(404, res, "Comment not found");
      }

      // Check if the user is the owner of the comment
      if (comment.userId !== req.user.id) {
        return this.errorResponse(403, res, "You can only update your own comments");
      }

      const updateQuery = {
        where: { id },
      };

      await LessonCommentRepo.updateComment(
        validationResult.data,
        updateQuery,
        { transaction }
      );

      await transaction.commit();

      // Fetch the updated comment
      const updatedComment = await LessonCommentRepo.findComment({
        where: { id },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username', 'imageUrl']
          }
        ]
      });

      return this.successResponse(
        200,
        res,
        updatedComment,
        "Comment updated successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating comment:", error);
      return this.serverErrorResponse(res, "Failed to update comment");
    }
  };

  // Delete comment
  deleteComment = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(
          res,
          "Valid comment ID is required"
        );
      }

      const comment = await LessonCommentRepo.findComment({
        where: { id },
      });

      if (!comment) {
        return this.errorResponse(404, res, "Comment not found");
      }

      // Check if the user is the owner of the comment or an admin
      if (comment.userId !== req.user.id && req.user.role.name !== "Admin") {
        return this.errorResponse(403, res, "You can only delete your own comments");
      }

      // If it's a top-level comment, delete all replies first
      if (comment.parentId === null) {
        await LessonCommentRepo.deleteComment({
          where: { parentId: id },
          transaction
        });
      }

      // Delete the comment
      await LessonCommentRepo.deleteComment({
        where: { id },
        transaction
      });

      await transaction.commit();

      return this.successResponse(
        200,
        res,
        { id },
        "Comment deleted successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting comment:", error);
      return this.serverErrorResponse(res, "Failed to delete comment");
    }
  };
}

module.exports = new LessonCommentController(); 