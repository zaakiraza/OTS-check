"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("AttemptAnswers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attemptId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "QuizAttempts",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      questionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      selectedOptionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Options",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      isCorrect: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      pointsAwarded: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add unique constraint for attempt_id and question_id
    await queryInterface.addConstraint("AttemptAnswers", {
      fields: ["attemptId", "questionId"],
      type: "unique",
      name: "uniq_attempt_question",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("AttemptAnswers");
  },
};
