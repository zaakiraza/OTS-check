"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Progress", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      enrollmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Enrollments",
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
      progress: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      completionPercentage: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
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

    // Add unique constraint for enrollment
    await queryInterface.addIndex("Progress", ["enrollmentId"], {
      unique: true,
      name: "progress_enrollment_unique"
    });

    // Add index for subcategory queries
    await queryInterface.addIndex("Progress", ["subcategoryId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Progress");
  },
}; 