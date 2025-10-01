const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class AttemptAnswerRepo extends BaseRepository {
  model;
  constructor() {
    super(db.AttemptAnswer);
    this.model = db.AttemptAnswer;
  }

  async createAnswer(answer) {
    return this.create(answer);
  }

  async findAnswers(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findAnswer(customQuery) {
    return this.findOne(customQuery);
  }

  async updateAnswer(data, query) {
    return this.update(data, query);
  }

  async deleteAnswer(query) {
    return this.delete(query);
  }

  async upsertAnswer(answerData) {
    return db.AttemptAnswer.upsert(answerData);
  }

  async findAnswersByAttempt(attemptId) {
    return this.findAll({
      where: { attemptId },
      include: [
        {
          model: db.Question,
          as: 'question',
          attributes: ['id', 'text', 'points']
        },
        {
          model: db.Option,
          as: 'selectedOption',
          attributes: ['id', 'text']
        }
      ]
    });
  }
}

module.exports = new AttemptAnswerRepo();
