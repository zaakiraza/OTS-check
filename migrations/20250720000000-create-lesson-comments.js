"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("LessonComments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lessonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Lessons",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "LessonComments",
          key: "id",
        },
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    // Add indexes for better query performance
    await queryInterface.addIndex("LessonComments", ["lessonId"]);
    await queryInterface.addIndex("LessonComments", ["userId"]);
    await queryInterface.addIndex("LessonComments", ["parentId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("LessonComments");
  },
}; 