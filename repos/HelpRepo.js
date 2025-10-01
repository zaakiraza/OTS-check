const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class HelpRepo extends BaseRepository {
    model;
    constructor() {
        super(db.Help);
        this.model = db.Help;
    }

    // Create a new help form submission
    async createHelp(help) {
        return this.create(help);
    }

    // Find all help submissions with optional custom query
    async findHelps(customQuery = null) {
        return this.findAll(customQuery);
    }

    // Find a specific help submission by custom query (e.g., ID)
    async findHelp(customQuery) {
        return this.findOne(customQuery);
    }

    // Delete a specific help submission
    async deleteHelp(query) {
        return this.delete(query);
    }
}

module.exports = new HelpRepo();