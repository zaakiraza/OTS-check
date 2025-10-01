"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    static associate(models) {
      // Define associations
      Subject.belongsTo(models.SubCategory, { foreignKey: 'subcategoryId' });
      Subject.belongsTo(models.User, { 
        foreignKey: 'instructorId',
        as: 'instructor'
      });
      Subject.hasMany(models.Chapter, { foreignKey: 'subjectId' });
      Subject.hasMany(models.SubjectRating, { 
        foreignKey: 'subjectId',
        as: 'ratings'
      });
    }
  }

  Subject.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'SubCategories',
          key: 'id',
        }
      },
      instructorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      sequelize,
      modelName: "Subject",
    }
  );

  return Subject;
}; 