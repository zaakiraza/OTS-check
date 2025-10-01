"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Lessons", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chapterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Chapters",
          key: "id",
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER, // Duration in minutes
        allowNull: true,
      },
      contentUrl: {
        type: Sequelize.STRING,
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

    // Add an index to improve query performance
    await queryInterface.addIndex("Lessons", ["chapterId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Lessons");
  },
}; 