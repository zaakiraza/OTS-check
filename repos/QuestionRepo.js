const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class QuestionRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Question);
    this.model = db.Question;
  }

  async createQuestion(question) {
    return this.create(question);
  }

  async findQuestions(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findQuestion(customQuery) {
    return this.findOne(customQuery);
  }

  async updateQuestion(data, query) {
    return this.update(data, query);
  }

  async deleteQuestion(query) {
    return this.delete(query);
  }

  async findQuestionWithOptions(customQuery) {
    return this.findOne({
      ...customQuery,
      include: [
        {
          model: db.Option,
          as: "options",
        },
        {
          model: db.Option,
          as: "correctOption",
        },
      ],
    });
  }

  async createQuestionWithOptions(
    questionData,
    optionsData,
    correctOptionIndex,
    transaction
  ) {
    // Create the question first
    const question = await db.Question.create(questionData, { transaction });

    // Add questionId to each option
    const optionsWithQuestionId = optionsData.map((option, index) => ({
      ...option,
      questionId: question.id,
      displayOrder: index,
    }));

    // Create all options
    const options = await db.Option.bulkCreate(optionsWithQuestionId, {
      transaction,
      returning: true,
    });

    // Set the correct option if specified
    if (
      correctOptionIndex !== null &&
      correctOptionIndex >= 0 &&
      correctOptionIndex < options.length
    ) {
      const correctOption = options[correctOptionIndex];
      await question.update(
        { correctOptionId: correctOption.id },
        { transaction }
      );
    }

    return {
      question,
      options,
      correctOption:
        correctOptionIndex !== null ? options[correctOptionIndex] : null,
    };
  }

  async setCorrectOption(questionId, correctOptionId, transaction = null) {
    // Verify the option belongs to this question
    const option = await db.Option.findOne({
      where: {
        id: correctOptionId,
        questionId: questionId,
      },
      transaction,
    });

    if (!option) {
      throw new Error("Option does not belong to this question");
    }

    return await this.update(
      { correctOptionId },
      { where: { id: questionId } },
      transaction
    );
  }

  async findAllQuestions(customQuery = null) {
    return this.findAll({
      ...customQuery,
    });
  }

  async findAllQuestionsWithOptions(customQuery = null) {
    return this.findAll({
      ...customQuery,
      include: [
        {
          model: db.Option,
          as: "options",
        },
        {
          model: db.Option,
          as: "correctOption",
        },
      ],
    });
  }
}

module.exports = new QuestionRepo();
