'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EducationalInfo extends Model {
    static associate(models) {
      // Define associations
      EducationalInfo.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  EducationalInfo.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      className: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      institutionType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      institutionName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      boardSystem: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passingYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isCurrentEducation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'EducationalInfo',
      tableName: 'EducationalInfo'
    }
  );

  return EducationalInfo;
}; 