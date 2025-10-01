"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    static associate(models) {
      // Define associations
      Lesson.belongsTo(models.Chapter, { foreignKey: 'chapterId' });
      // Add association with LessonComment
      Lesson.hasMany(models.LessonComment, { foreignKey: 'lessonId' });
    }
  }

  Lesson.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chapterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Chapters',
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
      contentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoUrls: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
    },
    {
      sequelize,
      modelName: "Lesson",
    }
  );

  return Lesson;
}; 