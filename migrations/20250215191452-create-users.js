"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Roles",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      dob: Sequelize.DATE,
      gender: Sequelize.STRING,
      imageUrl: Sequelize.STRING,
      qualification: Sequelize.STRING,
      designation: Sequelize.STRING,
      youAre: Sequelize.STRING,
      rememberToken: Sequelize.STRING,
      resetCode: Sequelize.STRING,
      resetCodeExpiresAt: Sequelize.DATE,
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Users");
  },
};
