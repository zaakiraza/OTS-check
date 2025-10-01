"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
      User.hasMany(models.Subject, {
        foreignKey: "instructorId",
        as: "subjects",
      });
      // Add association with LessonComment
      User.hasMany(models.LessonComment, {
        foreignKey: "userId",
        as: "lessonComments",
      });
      // Add associations with EducationalInfo and Course
      User.hasOne(models.EducationalInfo, {
        foreignKey: "userId",
        as: "educationalInfo",
      });
      User.hasMany(models.Course, {
        foreignKey: "userId",
        as: "courses",
      });
    }
  }

  User.init(
    {
      firstName: DataTypes.STRING(255),
      lastName: DataTypes.STRING(255),
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true, // Allow null for OAuth users
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // Need to create seperate user roles table in future
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qualification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      youAre: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      rememberToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      resetCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      resetCodeExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
