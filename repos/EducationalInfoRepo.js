const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class EducationalInfoRepo extends BaseRepository {
  model;
  constructor() {
    super(db.EducationalInfo);
    this.model = db.EducationalInfo;
  }

  async createEducationalInfo(data) {
    return this.create(data);
  }

  async findEducationalInfos(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findEducationalInfo(customQuery) {
    return this.findOne(customQuery);
  }

  async updateEducationalInfo(data, query) {
    return this.update(data, query);
  }

  async deleteEducationalInfo(query) {
    return this.delete(query);
  }

  async bulkCreateEducationalInfo(data) {
    return this.bulkCreate(data);
  }
}

module.exports = new EducationalInfoRepo(); 