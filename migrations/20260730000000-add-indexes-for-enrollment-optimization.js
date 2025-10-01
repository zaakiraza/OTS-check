'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes to improve enrollment performance
    
    // Index for looking up enrollments by student and subcategory (commonly used together)
    await queryInterface.addIndex('Enrollments', ['studentId', 'subcategoryId'], {
      name: 'idx_enrollments_student_subcategory',
      unique: true, // Make this a unique constraint to enforce one enrollment per student per subcategory
    });
    
    // Index for studentId in Enrollments (for getEnrollmentsByStudent)
    await queryInterface.addIndex('Enrollments', ['studentId'], {
      name: 'idx_enrollments_student',
    });
    
    // Index for subcategoryId in Enrollments (for filtering)
    await queryInterface.addIndex('Enrollments', ['subcategoryId'], {
      name: 'idx_enrollments_subcategory',
    });
    
    // Index for status in Enrollments (for filtering)
    await queryInterface.addIndex('Enrollments', ['status'], {
      name: 'idx_enrollments_status',
    });
    
    // Index for enrollmentDate in Enrollments (for sorting)
    await queryInterface.addIndex('Enrollments', ['enrollmentDate'], {
      name: 'idx_enrollments_date',
    });
    
    // Index for Progress table to speed up fetching progress data
    await queryInterface.addIndex('Progress', ['enrollmentId'], {
      name: 'idx_progress_enrollment',
      unique: true, // Only one progress record per enrollment
    });
    
    // Index for Progress table by subcategoryId
    await queryInterface.addIndex('Progress', ['subcategoryId'], {
      name: 'idx_progress_subcategory',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the indexes when rolling back
    await queryInterface.removeIndex('Enrollments', 'idx_enrollments_student_subcategory');
    await queryInterface.removeIndex('Enrollments', 'idx_enrollments_student');
    await queryInterface.removeIndex('Enrollments', 'idx_enrollments_subcategory');
    await queryInterface.removeIndex('Enrollments', 'idx_enrollments_status');
    await queryInterface.removeIndex('Enrollments', 'idx_enrollments_date');
    await queryInterface.removeIndex('Progress', 'idx_progress_enrollment');
    await queryInterface.removeIndex('Progress', 'idx_progress_subcategory');
  }
}; 