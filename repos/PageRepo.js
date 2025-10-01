const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class PageRepo extends BaseRepository {
    model;
    constructor() {
        super(db.Page);  // Using the 'Page' model
        this.model = db.Page;
    }

    // Create a new page (either Privacy Policy or Terms & Conditions)
    async createPage(pageData) {
        return this.create(pageData);
    }

    // Find a page by title or slug
    async findPageBySlug(slug) {
        return this.findOne({ where: { slug } });
    }

    // Update a page (including slug)
    async updatePage(data, slug) {
        return this.update(data, { where: { slug } });
    }

    // Fetch all pages
    async findAllPages(customQuery = null) {
        return this.findAll(customQuery);
    }

    // Delete a page (by slug)
    async deletePage(query) {
        return this.model.destroy({
            where: { slug: query.slug },  // Ensure the query object contains a slug
        });
    }

    async getAllPageTitles() {
        return this.model.findAll({
            attributes: ['title'],
        });
    }
}

module.exports = new PageRepo();
