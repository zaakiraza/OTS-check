"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Define associations
      Question.belongsTo(models.Quiz, { 
        foreignKey: 'quizId', 
        as: 'quiz',
        onDelete: 'CASCADE'
      });
      Question.hasMany(models.Option, { 
        foreignKey: 'questionId', 
        as: 'options',
        onDelete: 'CASCADE'
      });
      Question.belongsTo(models.Option, { 
        foreignKey: 'correctOptionId', 
        as: 'correctOption',
        onDelete: 'SET NULL'
      });
      Question.hasMany(models.AttemptAnswer, { 
        foreignKey: 'questionId', 
        as: 'attemptAnswers',
        onDelete: 'CASCADE'
      });
    }
  }

  Question.init(
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
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      points: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 1.0,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      correctOptionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Options',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: "Question",
      indexes: [
        {
          fields: ['quizId']
        }
      ]
    }
  );

  return Question;
};
