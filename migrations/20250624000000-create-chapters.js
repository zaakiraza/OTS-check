"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Chapters", {
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
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Subjects",
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
    await queryInterface.addIndex("Chapters", ["subjectId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Chapters");
  },
}; 