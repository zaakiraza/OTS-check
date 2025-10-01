"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SubjectRatings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Subjects",
          key: "id",
        },
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: Sequelize.TEXT,
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

    // Add unique constraint to ensure one user can rate a subject only once
    await queryInterface.addConstraint("SubjectRatings", {
      fields: ["userId", "subjectId"],
      type: "unique",
      name: "unique_user_subject_rating"
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("SubjectRatings", ["userId"]);
    await queryInterface.addIndex("SubjectRatings", ["subjectId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("SubjectRatings");
  },
}; 