const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class CategoryRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Category);
    this.model = db.Category;
  }

  async createCategory(category) {
    return this.create(category);
  }

  async findCategories(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findCategory(customQuery) {
    return this.findOne(customQuery);
  }

  async updateCategory(data, query) {
    return this.update(data, query);
  }

  async deleteCategory(query) {
    return this.delete(query);
  }
}

module.exports = new CategoryRepo(); 