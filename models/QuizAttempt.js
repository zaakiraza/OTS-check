"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuizAttempt extends Model {
    static associate(models) {
      // Define associations
      QuizAttempt.belongsTo(models.Quiz, { 
        foreignKey: 'quizId', 
        as: 'quiz',
        onDelete: 'CASCADE'
      });
      QuizAttempt.belongsTo(models.User, { 
        foreignKey: 'studentId', 
        as: 'student',
        onDelete: 'CASCADE'
      });
      QuizAttempt.hasMany(models.AttemptAnswer, { 
        foreignKey: 'attemptId', 
        as: 'answers',
        onDelete: 'CASCADE'
      });
    }
  }

  QuizAttempt.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Quizzes',
          key: 'id',
        },
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      score: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      durationSec: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "QuizAttempt",
      indexes: [
        {
          name: 'idx_quiz',
          fields: ['quizId']
        },
        {
          name: 'idx_student',
          fields: ['studentId']
        }
      ]
    }
  );

  return QuizAttempt;
};
