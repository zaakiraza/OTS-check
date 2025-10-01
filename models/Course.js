'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      // Define associations
      Course.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Course.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      courseName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      institutionName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'Courses'
    }
  );

  return Course;
}; 