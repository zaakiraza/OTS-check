"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Questions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Quizzes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      points: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 1.0,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      correctOptionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: {
        //   model: "Options",
        //   key: "id",
        // },
        onDelete: "SET NULL",
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

    // Add foreign key index
    await queryInterface.addIndex("Questions", ["quizId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Questions");
  },
};
