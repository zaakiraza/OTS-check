"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Quizzes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Lesson, Chapter",
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      timeLimitSec: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
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

    // Add indexes for better performance
    await queryInterface.addIndex("Quizzes", ["entityType", "entityId"], {
      name: "idx_entity",
    });
    await queryInterface.addIndex("Quizzes", ["isActive"], {
      name: "idx_active",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Quizzes");
  },
};
