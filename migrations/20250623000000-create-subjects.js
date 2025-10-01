"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Subjects", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subcategoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SubCategories",
          key: "id",
        },
      },
      instructorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: true,
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

    // Add indexes to improve query performance
    await queryInterface.addIndex("Subjects", ["subcategoryId"]);
    await queryInterface.addIndex("Subjects", ["instructorId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Subjects");
  },
}; 