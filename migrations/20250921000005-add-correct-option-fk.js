"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key constraint from Questions.correctOptionId to Options.id
    await queryInterface.addConstraint("Questions", {
      fields: ["correctOptionId"],
      type: "foreign key",
      name: "fk_questions_correct_option",
      references: {
        table: "Options",
        field: "id",
      },
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint("Questions", "fk_questions_correct_option");
  },
};
