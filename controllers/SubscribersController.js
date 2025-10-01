const BaseController = require("./BaseController.js");
const SubscribersRepo = require("../repos/SubscribersRepo.js");
const SubscribersValidator = require("../validators/SubscribersValidator.js");
const sendMail = require("../utils/mailer.js");
const UserRepo = require("../repos/UserRepo.js");

class SubscribersController extends BaseController {
  constructor() {
    super();
  }

  // Get all subscribers
  getAllSubscribers = async (req, res) => {
    try {
      const { page = 1, limit = 10, subscribe } = req.query; // Extract 'subscribe' query if exists
      const offset = (page - 1) * limit;
      const pagination = {
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      // Custom query for pagination and subscribe filter (if provided)
      const customQuery = {
        where: {
          // If 'subscribe' is provided, filter based on it
          ...(subscribe !== undefined
            ? { subscribe: subscribe === "true" }
            : {}),
        },
        ...pagination,
      };

      const subscribers = await SubscribersRepo.findSubscribers(customQuery);

      if (subscribers.length === 0) {
        return this.errorResponse(404, res, "No subscribers found");
      }

      // Pagination metadata
      const totalSubscribers = await SubscribersRepo.count(customQuery); // Count with the same query
      const totalPages = Math.ceil(totalSubscribers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        subscribers,
        pagination: {
          totalSubscribers,
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
        "Subscribers retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subscribers");
    }
  };

  // Get subscriber by email
  getSubscriberByEmail = async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return this.validationErrorResponse(res, "Email is required");
      }

      const subscriber = await SubscribersRepo.findSubscriber({
        where: { email },
      });

      if (!subscriber) {
        return this.errorResponse(404, res, "Subscriber not found");
      }

      return this.successResponse(
        200,
        res,
        subscriber,
        "Subscriber retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching subscriber:", error);
      return this.serverErrorResponse(res, "Failed to retrieve subscriber");
    }
  };

  // Subscribe a user
  subscribeUser = async (req, res) => {
    const validationResult = SubscribersValidator.validateSubscribeUser(
      req.body
    );

    if (!validationResult.status) {
      return this.validationErrorResponse(res, validationResult.message);
    }

    const { email } = req.body;

    try {
      // Check if the subscriber already exists
      const existingSubscriber = await SubscribersRepo.findSubscriber({
        where: { email },
      });

      if (existingSubscriber) {
        if (existingSubscriber.subscribe === false) {
          existingSubscriber.subscribe = true;
          await existingSubscriber.save();
          return this.successResponse(
            200,
            res,
            existingSubscriber,
            "Thanks for subscribing"
          );
        } else {
          return this.successResponse(
            200,
            res,
            existingSubscriber,
            "You are already subscribed"
          );
        }
      }

      // If the subscriber doesn't exist, check if the email is in the users table
      const user = await UserRepo.findUser({ where: { email } });

      // If the email is found in the users table, get their userId
      let userId = null;
      if (user) {
        userId = user.id;
      }

      // Email data
      const emailData = {
        email,
        subject: "Subscription Confirmation",
        text: `Hello,\n\nThank you for subscribing to our newsletter! We're excited to have you on board.\n\nBest regards,\nThe Team`,
      };

      // Send confirmation email to the user
      const sentMail = await sendMail(
        emailData.email,
        emailData.subject,
        emailData.text
      );

      const subscriber = await SubscribersRepo.createSubscriber({
        email,
        subscribe: true,
        userId,
      });

      return this.successResponse(
        201,
        res,
        subscriber,
        "User subscribed successfully and confirmation email sent."
      );
    } catch (error) {
      console.error("Error subscribing user:", error);
      return this.serverErrorResponse(res, "Failed to subscribe user");
    }
  };

  // Delete subscriber by email
  deleteSubscriber = async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return this.validationErrorResponse(res, "Email is required");
      }

      // Check if the subscriber exists
      const subscriber = await SubscribersRepo.findSubscriber({
        where: { email },
      });

      if (!subscriber) {
        return this.errorResponse(404, res, "Subscriber not found");
      }

      // Proceed with deletion
      await SubscribersRepo.deleteSubscriber({ where: { email } });

      return this.successResponse(
        200,
        res,
        null,
        "Subscriber deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      return this.serverErrorResponse(res, "Failed to delete subscriber");
    }
  };

  // Update subscription status (set subscribe to false)
  updateSubscriptionStatus = async (req, res) => {
    const validationResult = SubscribersValidator.validateSubscribeUser(
      req.body
    );

    if (!validationResult.status) {
      return this.validationErrorResponse(res, validationResult.message);
    }

    const { email } = req.body;

    try {
      // Update the subscription status (set subscribe to false)
      const subscriber = await SubscribersRepo.updateSubscriptionStatus(
        email,
        false
      );

      if (!subscriber) {
        return this.errorResponse(404, res, "Subscriber not found");
      }

      return this.successResponse(
        200,
        res,
        subscriber,
        "User unsubscribed successfully"
      );
    } catch (error) {
      console.error("Error updating subscription status:", error);
      return this.serverErrorResponse(
        res,
        "Failed to update subscription status"
      );
    }
  };
}

module.exports = new SubscribersController();
