const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");
const { Sequelize } = require("sequelize");

class SubjectRatingRepo extends BaseRepository {
  model;
  constructor() {
    super(db.SubjectRating);
    this.model = db.SubjectRating;
  }

  async createRating(rating) {
    return this.create(rating);
  }

  async findRating(customQuery) {
    return this.findOne(customQuery);
  }

  async findRatings(customQuery = null) {
    return this.findAll(customQuery);
  }

  async updateRating(data, query) {
    return this.update(data, query);
  }

  async deleteRating(query) {
    return this.delete(query);
  }

  async getRatingsBySubject(subjectId) {
    return this.findAll({
      where: { subjectId },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'imageUrl']
        }
      ]
    });
  }

  async getUserRatingForSubject(userId, subjectId) {
    return this.findOne({
      where: { userId, subjectId }
    });
  }

  async getAverageRatingForSubject(subjectId) {
    const result = await this.model.findOne({
      where: { subjectId },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRatings']
      ],
      raw: true
    });

    return {
      averageRating: result?.averageRating ? parseFloat(result.averageRating).toFixed(1) : 0,
      totalRatings: result?.totalRatings || 0
    };
  }
}

module.exports = new SubjectRatingRepo(); 