"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the admin role ID
    const adminRole = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'Admin' OR name = 'Super Admin' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const roleId = adminRole[0]?.id;
    
    if (!roleId) {
      console.error("Admin role not found. Please run the roles seeder first.");
      return;
    }
    
    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync("admin123", salt);
    
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        email: "admin@example.com",
        phone: "12345678901",
        password: hashedPassword,
        roleId: roleId,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("Users", { email: "admin@example.com" }, {});
  }
}; 