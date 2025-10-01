const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");

class QuizAttemptRepo extends BaseRepository {
  model;
  constructor() {
    super(db.QuizAttempt);
    this.model = db.QuizAttempt;
  }

  async createAttempt(attempt) {
    return this.create(attempt);
  }

  async findAttempts(customQuery = null) {
    return this.findAll(customQuery);
  }

  async findAttempt(customQuery) {
    return this.findOne(customQuery);
  }

  async updateAttempt(data, query) {
    return this.update(data, query);
  }

  async deleteAttempt(query) {
    return this.delete(query);
  }

  async findAttemptWithAnswers(customQuery) {
    return this.findOne({
      ...customQuery,
      include: [
        {
          model: db.AttemptAnswer,
          as: 'answers',
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
        },
        {
          model: db.Quiz,
          as: 'quiz',
          attributes: ['id', 'title']
        },
        {
          model: db.User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
  }

  async submitAttempt(attemptId, studentId, answers, transaction) {
    const attempt = await this.findOne({ 
      where: { id: attemptId, studentId },
      include: [
        {
          model: db.Quiz,
          as: 'quiz',
          include: [
            {
              model: db.Question,
              as: 'questions',
              include: [
                {
                  model: db.Option,
                  as: 'options'
                }
              ]
            }
          ]
        }
      ],
      transaction
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    if (!attempt.quiz.isActive) {
      throw new Error('Cannot submit to inactive quiz');
    }

    if (attempt.submittedAt) {
      throw new Error('Attempt already submitted');
    }

    // Validate all questions belong to the quiz
    const quizQuestionIds = attempt.quiz.questions.map(q => q.id);
    const answerQuestionIds = answers.map(a => a.questionId);
    
    for (const questionId of answerQuestionIds) {
      if (!quizQuestionIds.includes(questionId)) {
        throw new Error(`Question ${questionId} does not belong to this quiz`);
      }
    }

    // Process each answer
    let totalScore = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = attempt.quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      // Validate selected option belongs to question
      if (answer.selectedOptionId) {
        const validOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        if (!validOption) {
          throw new Error(`Option ${answer.selectedOptionId} does not belong to question ${answer.questionId}`);
        }
      }

      // Calculate if answer is correct
      const isCorrect = answer.selectedOptionId === question.correctOptionId;
      const pointsAwarded = isCorrect ? parseFloat(question.points) : 0;
      totalScore += pointsAwarded;

      // Upsert the answer
      await db.AttemptAnswer.upsert({
        attemptId: attemptId,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: isCorrect ? 1 : 0,
        pointsAwarded: pointsAwarded
      }, { transaction });

      processedAnswers.push({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
        pointsAwarded
      });
    }

    // Update attempt with submission details
    const submittedAt = new Date();
    const durationSec = Math.floor((submittedAt - new Date(attempt.startedAt)) / 1000);
    
    await this.update({
      score: totalScore,
      submittedAt: submittedAt,
      durationSec: durationSec
    }, { 
      where: { id: attemptId },
      transaction 
    });

    return {
      attemptId: attemptId,
      quizId: attempt.quizId,
      studentId: studentId,
      score: totalScore,
      submittedAt: submittedAt,
      durationSec: durationSec,
      answers: processedAnswers
    };
  }

  async findStudentAttempts(studentId, customQuery = {}) {
    return this.findAll({
      where: { 
        studentId,
        ...customQuery.where 
      },
      include: [
        {
          model: db.Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'entityType', 'entityId']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...customQuery
    });
  }
}

module.exports = new QuizAttemptRepo();
