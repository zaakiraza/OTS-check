const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class SubscribeRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Subscriber); // Use the Subscriber model
    this.model = db.Subscriber;
  }

  // Create a new subscriber
  async createSubscriber(subscriber) {
    return this.create(subscriber);
  }

  // Find all subscribers with optional custom query
  async findSubscribers(customQuery = null) {
    return this.findAll(customQuery);
  }

  // Find a specific subscriber by custom query
  async findSubscriber(customQuery) {
    return this.findOne(customQuery);
  }

  // Update subscription status (set subscribe to false)
  async updateSubscriptionStatus(email, subscribeStatus) {
    try {
      const subscriber = await this.model.findOne({ where: { email } });
      if (!subscriber) {
        return null; // If no subscriber found, return null
      }

      // Update the subscription status
      subscriber.subscribe = subscribeStatus;
      await subscriber.save(); // Save the updated subscriber

      return subscriber; // Return the updated subscriber
    } catch (error) {
      console.error("Error updating subscription status:", error);
      throw error; // Rethrow error if any occurs
    }
  }

  // Update a subscriber
  // async updateSubscriber(data, query) {
  //   return this.update(data, query);
  // }

  // Delete a subscriber (set subscribe to false)
  async deleteSubscriber(query) {
    return this.delete(query);
  }

  async deleteSubscriber(query) {
    try {
      const subscriber = await this.model.findOne(query);
      if (!subscriber) {
        return null; // If no subscriber found, return null
      }

      await subscriber.destroy(); // Delete the subscriber record
      return subscriber; // Return the deleted subscriber (optional, for confirmation)
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      throw error; // Rethrow error if any occurs
    }
  }
}

module.exports = new SubscribeRepo();