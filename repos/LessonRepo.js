const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class LessonRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Lesson);
    this.model = db.Lesson;
  }

  async createLesson(lesson) {
    return this.create(lesson);
  }

  async findLessons(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findLesson(customQuery) {
    return this.findOne(customQuery);
  }

  async updateLesson(data, query) {
    return this.update(data, query);
  }

  async deleteLesson(query) {
    return this.delete(query);
  }

  async count(whereClause = {}) {
    return this.model.count({ where: whereClause });
  }
}

module.exports = new LessonRepo(); 