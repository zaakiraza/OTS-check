const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class TestimonialRepo extends BaseRepository {
    model;
    constructor() {
        super(db.Testimonial); // Use the Testimonial model
        this.model = db.Testimonial;
    }

    // Create a new testimonial
    async createTestimonial(testimonial) {
        return this.create(testimonial);
    }

    // Find all testimonials with optional custom query
    async findTestimonials(customQuery = null) {
        return this.findAll(customQuery);
    }

    // Find a specific testimonial by custom query
    async findTestimonial(customQuery) {
        return this.findOne(customQuery);
    }

    // Update a testimonial
    async updateTestimonial(data, query) {
        return this.update(data, query);
    }

    // Delete a testimonial
    async deleteTestimonial(query) {
        return this.delete(query);
    }

    async deleteTestimonial(query) {
        return this.delete(query);
    }
}

module.exports = new TestimonialRepo();
