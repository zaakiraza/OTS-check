"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "emailVerified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "resetCodeExpiresAt" // This places the column after resetCodeExpiresAt
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "emailVerified");
  },
}; 