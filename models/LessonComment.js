"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LessonComment extends Model {
    static associate(models) {
      // Define associations
      LessonComment.belongsTo(models.Lesson, { foreignKey: 'lessonId' });
      LessonComment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      
      // Self-reference for parent-child relationship
      LessonComment.belongsTo(models.LessonComment, { 
        foreignKey: 'parentId', 
        as: 'parent' 
      });
      
      LessonComment.hasMany(models.LessonComment, { 
        foreignKey: 'parentId',
        as: 'replies'
      });
    }
  }

  LessonComment.init(
    {
      lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Lessons',
          key: 'id',
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'LessonComments',
          key: 'id',
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LessonComment",
    }
  );

  return LessonComment;
}; 