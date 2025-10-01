const express = require("express");
const router = express.Router();
const SubscribersController = require("../controllers/SubscribersController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.post("/subscribe", SubscribersController.subscribeUser); // Subscribe a user

// Admin routes (requires authentication and admin role)
router.get("/", authenticateToken, isAdmin, SubscribersController.getAllSubscribers); // Get all subscribers
router.get("/:email", authenticateToken, isAdmin, SubscribersController.getSubscriberByEmail); // Get subscriber by email
router.patch("/update-subscription", authenticateToken, isAdmin, SubscribersController.updateSubscriptionStatus); // Update subscription status (subscribe/unsubscribe)
router.delete("/:email", authenticateToken, isAdmin, SubscribersController.deleteSubscriber); // Delete subscriber by email

// Export the router
module.exports = router;