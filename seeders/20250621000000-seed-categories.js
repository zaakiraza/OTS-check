"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert("Categories", [
      { 
        name: "Academic", 
        imageUrl: "https://example.com/images/academic.jpg",
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: "Skill Based", 
        imageUrl: "https://example.com/images/skill-based.jpg",
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("Categories", null, {});
  },
}; 