"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static associate(models) {
      // Define associations
      Enrollment.belongsTo(models.User, { 
        foreignKey: 'studentId',
        as: 'student'
      });
      
      Enrollment.belongsTo(models.SubCategory, { 
        foreignKey: 'subcategoryId',
        as: 'subcategory'
      });
      
      Enrollment.hasOne(models.Progress, { 
        foreignKey: 'enrollmentId',
        as: 'progress'
      });
    }
  }

  Enrollment.init(
    {
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      subcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'SubCategories',
          key: 'id',
        }
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        allowNull: true,
      },
      enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "Enrollment",
    }
  );

  return Enrollment;
}; 