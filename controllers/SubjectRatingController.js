const BaseController = require("./BaseController.js");
const SubjectRatingRepo = require("../repos/SubjectRatingRepo.js");
const SubjectRepo = require("../repos/SubjectRepo.js");
const SubjectRatingValidator = require("../validators/SubjectRatingValidator.js");
const db = require("../models/index.js");

class SubjectRatingController extends BaseController {
  constructor() {
    super();
  }

  // Rate a subject or update an existing rating
  rateSubject = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      // Get user ID from authenticated user
      const userId = req.user.id;
      
      const validationResult = SubjectRatingValidator.validateCreateRating(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { subjectId, rating, comment } = validationResult.data;

      // Check if subject exists
      const subject = await SubjectRepo.findSubject({
        where: { id: subjectId },
      });

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      // Check if user has already rated this subject
      const existingRating = await SubjectRatingRepo.getUserRatingForSubject(userId, subjectId);

      let result;
      let message;

      if (existingRating) {
        // Update existing rating
        await SubjectRatingRepo.updateRating(
          { rating, comment },
          { where: { id: existingRating.id } },
          { transaction }
        );
        
        result = await SubjectRatingRepo.findRating({
          where: { id: existingRating.id },
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        });
        
        message = "Rating updated successfully";
      } else {
        // Create new rating
        result = await SubjectRatingRepo.createRating(
          {
            userId,
            subjectId,
            rating,
            comment
          },
          { transaction }
        );
        
        message = "Rating submitted successfully";
      }

      // Calculate new average rating
      const { averageRating, totalRatings } = await SubjectRatingRepo.getAverageRatingForSubject(subjectId);
      
      // Update subject's rating
      await SubjectRepo.updateSubject(
        { rating: parseFloat(averageRating) },
        { where: { id: subjectId } },
        { transaction }
      );

      await transaction.commit();

      // Return response with updated rating info
      return this.successResponse(
        200,
        res,
        {
          rating: result,
          subject: {
            id: subject.id,
            name: subject.name,
            averageRating,
            totalRatings
          }
        },
        message
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error rating subject:", error);
      return this.serverErrorResponse(res, "Failed to rate subject");
    }
  };

  // Get all ratings for a subject
  getSubjectRatings = async (req, res) => {
    try {
      const { subjectId } = req.params;

      if (!subjectId || isNaN(subjectId)) {
        return this.validationErrorResponse(
          res,
          "Valid subject ID is required"
        );
      }

      // Check if subject exists
      const subject = await SubjectRepo.findSubject({
        where: { id: subjectId },
      });

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      // Get all ratings for the subject
      const ratings = await SubjectRatingRepo.getRatingsBySubject(subjectId);
      
      // Get average rating
      const { averageRating, totalRatings } = await SubjectRatingRepo.getAverageRatingForSubject(subjectId);

      return this.successResponse(
        200,
        res,
        {
          subject: {
            id: subject.id,
            name: subject.name,
            averageRating,
            totalRatings
          },
          ratings
        },
        "Subject ratings retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subject ratings:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subject ratings");
    }
  };

  // Get current user's rating for a subject
  getUserRating = async (req, res) => {
    try {
      const { subjectId } = req.params;
      const userId = req.user.id;

      if (!subjectId || isNaN(subjectId)) {
        return this.validationErrorResponse(
          res,
          "Valid subject ID is required"
        );
      }

      // Check if subject exists
      const subject = await SubjectRepo.findSubject({
        where: { id: subjectId },
      });

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      // Get user's rating for the subject
      const rating = await SubjectRatingRepo.getUserRatingForSubject(userId, subjectId);

      if (!rating) {
        return this.errorResponse(404, res, "You have not rated this subject yet");
      }

      return this.successResponse(
        200,
        res,
        rating,
        "User rating retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching user rating:", error);
      return this.serverErrorResponse(res, "Failed to retrieve user rating");
    }
  };

  // Delete a rating
  deleteRating = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { subjectId } = req.params;
      const userId = req.user.id;

      if (!subjectId || isNaN(subjectId)) {
        return this.validationErrorResponse(
          res,
          "Valid subject ID is required"
        );
      }

      // Check if subject exists
      const subject = await SubjectRepo.findSubject({
        where: { id: subjectId },
      });

      if (!subject) {
        return this.errorResponse(404, res, "Subject not found");
      }

      // Check if user has rated this subject
      const existingRating = await SubjectRatingRepo.getUserRatingForSubject(userId, subjectId);

      if (!existingRating) {
        return this.errorResponse(404, res, "You have not rated this subject");
      }

      // Delete the rating
      await SubjectRatingRepo.deleteRating(
        { where: { id: existingRating.id } },
        { transaction }
      );

      // Recalculate average rating
      const { averageRating } = await SubjectRatingRepo.getAverageRatingForSubject(subjectId);
      
      // Update subject's rating
      await SubjectRepo.updateSubject(
        { rating: parseFloat(averageRating) },
        { where: { id: subjectId } },
        { transaction }
      );

      await transaction.commit();

      return this.successResponse(
        200,
        res,
        null,
        "Rating deleted successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting rating:", error);
      return this.serverErrorResponse(res, "Failed to delete rating");
    }
  };
}

module.exports = new SubjectRatingController(); 