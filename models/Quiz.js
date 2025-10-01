"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    static associate(models) {
      // Define associations
      Quiz.hasMany(models.Question, { 
        foreignKey: 'quizId', 
        as: 'questions',
        onDelete: 'CASCADE'
      });
      Quiz.hasMany(models.QuizAttempt, { 
        foreignKey: 'quizId', 
        as: 'attempts',
        onDelete: 'CASCADE'
      });
    }
  }

  Quiz.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [['Lesson', 'Chapter', 'Course', 'Subject']]
        }
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      timeLimitSec: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Quiz",
      indexes: [
        {
          name: 'idx_entity',
          fields: ['entityType', 'entityId']
        },
        {
          name: 'idx_active',
          fields: ['isActive']
        }
      ]
    }
  );

  return Quiz;
};
