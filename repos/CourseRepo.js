const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class CourseRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Course);
    this.model = db.Course;
  }

  async createCourse(data) {
    return this.create(data);
  }

  async findCourses(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findCourse(customQuery) {
    return this.findOne(customQuery);
  }

  async updateCourse(data, query) {
    return this.update(data, query);
  }

  async deleteCourse(query) {
    return this.delete(query);
  }

  async bulkCreateCourse(data) {
    return this.bulkCreate(data);
  }
}

module.exports = new CourseRepo(); 