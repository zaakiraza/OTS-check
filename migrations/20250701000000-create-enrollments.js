"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Enrollments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      subcategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "SubCategories",
          key: "id",
        },
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      enrollmentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    // Add unique constraint to prevent duplicate enrollments
    await queryInterface.addIndex("Enrollments", ["studentId", "subcategoryId"], {
      unique: true,
      name: "enrollments_student_subcategory_unique"
    });

    // Add indexes to improve query performance
    await queryInterface.addIndex("Enrollments", ["studentId"]);
    await queryInterface.addIndex("Enrollments", ["subcategoryId"]);
    await queryInterface.addIndex("Enrollments", ["status"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Enrollments");
  },
}; 