"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubjectRating extends Model {
    static associate(models) {
      // Define associations
      SubjectRating.belongsTo(models.User, { 
        foreignKey: 'userId',
        as: 'user'
      });
      
      SubjectRating.belongsTo(models.Subject, { 
        foreignKey: 'subjectId',
        as: 'subject'
      });
    }
  }

  SubjectRating.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Subjects',
          key: 'id',
        }
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "SubjectRating",
      indexes: [
        {
          unique: true,
          fields: ['userId', 'subjectId']
        }
      ]
    }
  );

  return SubjectRating;
}; 