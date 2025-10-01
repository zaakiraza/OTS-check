"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuizAttempts", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Quizzes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      score: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      durationSec: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    // Add indexes for better performance
    await queryInterface.addIndex("QuizAttempts", ["quizId"], {
      name: "idx_quiz",
    });
    await queryInterface.addIndex("QuizAttempts", ["studentId"], {
      name: "idx_student",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("QuizAttempts");
  },
};
