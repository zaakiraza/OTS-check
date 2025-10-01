"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      // Define associations
      Progress.belongsTo(models.Enrollment, { 
        foreignKey: 'enrollmentId',
        as: 'enrollment'
      });
      
      Progress.belongsTo(models.SubCategory, { 
        foreignKey: 'subcategoryId',
        as: 'subcategory'
      });
    }
  }

  Progress.init(
    {
      enrollmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Enrollments',
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
      progress: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      },
      completionPercentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Progress",
      tableName: "Progress"
    }
  );

  return Progress;
}; 