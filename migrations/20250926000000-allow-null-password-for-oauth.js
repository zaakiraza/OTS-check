'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true, // Allow null passwords for OAuth users
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: false, // Revert back to not null
    });
  }
};