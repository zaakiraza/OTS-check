const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class OptionRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Option);
    this.model = db.Option;
  }

  async createOption(option) {
    return this.create(option);
  }

  async findOptions(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findOption(customQuery) {
    return this.findOne(customQuery);
  }

  async updateOption(data, query) {
    return this.update(data, query);
  }

  async deleteOption(query) {
    return this.delete(query);
  }

  async canDeleteOption(optionId) {
    // Check if this option is set as correct option for any question
    const questionWithThisCorrectOption = await db.Question.findOne({
      where: { correctOptionId: optionId }
    });
    
    return !questionWithThisCorrectOption;
  }

  async deleteOptionSafely(optionId, transaction = null) {
    // First check if it's safe to delete
    const canDelete = await this.canDeleteOption(optionId);
    if (!canDelete) {
      throw new Error('Cannot delete option that is currently set as correct answer');
    }
    
    return await this.delete({ where: { id: optionId } }, transaction);
  }

  async findOptionsByQuestion(questionId) {
    return this.findAll({
      where: { questionId },
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
    });
  }
}

module.exports = new OptionRepo();
