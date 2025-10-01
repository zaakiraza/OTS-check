"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AttemptAnswer extends Model {
    static associate(models) {
      // Define associations
      AttemptAnswer.belongsTo(models.QuizAttempt, { 
        foreignKey: 'attemptId', 
        as: 'attempt',
        onDelete: 'CASCADE'
      });
      AttemptAnswer.belongsTo(models.Question, { 
        foreignKey: 'questionId', 
        as: 'question',
        onDelete: 'CASCADE'
      });
      AttemptAnswer.belongsTo(models.Option, { 
        foreignKey: 'selectedOptionId', 
        as: 'selectedOption',
        onDelete: 'SET NULL'
      });
    }
  }

  AttemptAnswer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attemptId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'QuizAttempts',
          key: 'id',
        },
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Questions',
          key: 'id',
        },
      },
      selectedOptionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Options',
          key: 'id',
        },
      },
      isCorrect: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      },
      pointsAwarded: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "AttemptAnswer",
      indexes: [
        {
          name: 'uniq_attempt_question',
          fields: ['attemptId', 'questionId'],
          unique: true
        }
      ]
    }
  );

  return AttemptAnswer;
};
