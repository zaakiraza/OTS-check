const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class SubjectRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Subject);
    this.model = db.Subject;
  }

  async createSubject(subject) {
    return this.create(subject);
  }

  async findSubjects(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findSubject(customQuery) {
    return this.findOne(customQuery);
  }

  async updateSubject(data, query) {
    return this.update(data, query);
  }

  async deleteSubject(query) {
    return this.delete(query);
  }

  async count(whereClause = {}) {
    return this.model.count({ where: whereClause });
  }
}

module.exports = new SubjectRepo(); 