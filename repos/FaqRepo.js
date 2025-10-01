const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class FaqRepo extends BaseRepository {
    model;
    constructor() {
        super(db.Faq); // Use the Faq model
        this.model = db.Faq;
    }

    // Create a new FAQ
    async createFaq(faq) {
        return this.create(faq);
    }

    // Find all FAQs with optional custom query
    async findFaqs(customQuery = null) {
        return this.findAll(customQuery);
    }

    // Find a specific FAQ based on a custom query
    async findFaq(customQuery) {
        return this.findOne(customQuery);
    }

    // Update a specific FAQ
    async updateFaq(data, query) {
        return this.update(data, query);
    }

    // Delete a specific FAQ
    async deleteFaq(query) {
        return this.delete(query);
    }
}

module.exports = new FaqRepo();
