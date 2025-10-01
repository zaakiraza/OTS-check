const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class SubCategoryRepo extends BaseRepository {
  model;
  constructor() {
    super(db.SubCategory);
    this.model = db.SubCategory;
  }

  async createSubCategory(subCategory) {
    return this.create(subCategory);
  }

  async findSubCategories(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findSubCategory(customQuery) {
    return this.findOne(customQuery);
  }

  async updateSubCategory(data, query) {
    return this.update(data, query);
  }

  async deleteSubCategory(query) {
    return this.delete(query);
  }
}

module.exports = new SubCategoryRepo(); 