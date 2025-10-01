"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    static associate(models) {
      // Define associations
      Chapter.belongsTo(models.Subject, { foreignKey: 'subjectId' });
      Chapter.hasMany(models.Lesson, { foreignKey: 'chapterId' });
    }
  }

  Chapter.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Subjects',
          key: 'id',
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Chapter",
    }
  );

  return Chapter;
}; 