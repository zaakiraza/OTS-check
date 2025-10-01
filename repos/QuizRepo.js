const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class QuizRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Quiz);
    this.model = db.Quiz;
  }

  async createQuiz(quiz) {
    return this.create(quiz);
  }

  async findQuizzes(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findQuiz(customQuery) {
    return this.findOne(customQuery);
  }

  async updateQuiz(data, query) {
    return this.update(data, query);
  }

  async deleteQuiz(query) {
    return this.delete(query);
  }

  async findQuizWithQuestions(customQuery) {
    return this.findOne({
      ...customQuery,
      include: [
        {
          model: db.Question,
          as: 'questions',
          include: [
            {
              model: db.Option,
              as: 'options',
              attributes: ['id', 'text']
            }
          ],
          attributes: ['id', 'text', 'points']
        }
      ]
    });
  }

  async findQuizWithFullDetails(customQuery) {
    return this.findOne({
      ...customQuery,
      include: [
        {
          model: db.Question,
          as: 'questions',
          include: [
            {
              model: db.Option,
              as: 'options'
            },
            {
              model: db.Option,
              as: 'correctOption'
            }
          ]
        }
      ]
    });
  }

  async getQuizAttempts(customQuery) {
    return db.QuizAttempt.findAll({
      ...customQuery,
      include: [
        {
          model: db.User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: db.Quiz,
          as: 'quiz',
          attributes: ['id', 'title']
        }
      ]
    });
  }

  async getQuizStats(quizId) {
    const stats = await db.QuizAttempt.findAll({
      where: { quizId },
      attributes: [
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalAttempts'],
        [db.sequelize.fn('AVG', db.sequelize.col('score')), 'averageScore'],
        [db.sequelize.fn('MAX', db.sequelize.col('score')), 'highestScore'],
        [db.sequelize.fn('MIN', db.sequelize.col('score')), 'lowestScore'],
        [db.sequelize.fn('AVG', db.sequelize.col('durationSec')), 'averageDuration']
      ],
      raw: true
    });

    return stats[0] || {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averageDuration: 0
    };
  }
}

module.exports = new QuizRepo();
