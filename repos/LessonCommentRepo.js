const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class LessonCommentRepo extends BaseRepository {
  model;
  constructor() {
    super(db.LessonComment);
    this.model = db.LessonComment;
  }

  async createComment(comment) {
    return this.create(comment);
  }

  async findComments(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findComment(customQuery) {
    return this.findOne(customQuery);
  }

  async updateComment(data, query) {
    return this.update(data, query);
  }

  async deleteComment(query) {
    return this.delete(query);
  }

  async count(whereClause = {}) {
    return this.model.count({ where: whereClause });
  }
}

module.exports = new LessonCommentRepo(); 