const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class ProgressRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Progress);
    this.model = db.Progress;
  }

  async createProgress(progress) {
    return this.create(progress);
  }

  async findProgress(customQuery) {
    return this.findOne(customQuery);
  }

  async findAllProgress(customQuery = null) {
    return this.findAll(customQuery);
  }

  async updateProgress(data, query) {
    return this.update(data, query);
  }

  async deleteProgress(query) {
    return this.delete(query);
  }

  async getProgressByEnrollment(enrollmentId) {
    return this.findOne({
      where: { enrollmentId },
      include: [
        {
          model: db.Enrollment,
          as: 'enrollment',
          include: [
            {
              model: db.User,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: db.SubCategory,
              as: 'subcategory',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
  }

  async getProgressByStudent(studentId) {
    return this.findAll({
      include: [
        {
          model: db.Enrollment,
          as: 'enrollment',
          where: { studentId },
          include: [
            {
              model: db.SubCategory,
              as: 'subcategory',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
  }

  async updateProgressData(enrollmentId, progressData) {
    return this.update(
      { progress: progressData },
      { where: { enrollmentId } }
    );
  }
}

module.exports = new ProgressRepo(); 