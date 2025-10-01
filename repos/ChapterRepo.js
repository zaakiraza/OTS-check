const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class ChapterRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Chapter);
    this.model = db.Chapter;
  }

  async createChapter(chapter) {
    return this.create(chapter);
  }

  async findChapters(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findChapter(customQuery) {
    return this.findOne(customQuery);
  }

  async updateChapter(data, query) {
    return this.update(data, query);
  }

  async deleteChapter(query) {
    return this.delete(query);
  }

  async count(whereClause = {}) {
    return this.model.count({ where: whereClause });
  }
}

module.exports = new ChapterRepo(); 