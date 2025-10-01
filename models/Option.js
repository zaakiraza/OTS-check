"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    static associate(models) {
      // Define associations
      Option.belongsTo(models.Question, { 
        foreignKey: 'questionId', 
        as: 'question',
        onDelete: 'CASCADE'
      });
      Option.hasMany(models.Question, { 
        foreignKey: 'correctOptionId', 
        as: 'questionsAsCorrect',
        onDelete: 'SET NULL'
      });
      Option.hasMany(models.AttemptAnswer, { 
        foreignKey: 'selectedOptionId', 
        as: 'attemptAnswers',
        onDelete: 'SET NULL'
      });
    }
  }

  Option.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Questions',
          key: 'id',
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Option",
      indexes: [
        {
          name: 'idx_q',
          fields: ['questionId']
        }
      ]
    }
  );

  return Option;
};
