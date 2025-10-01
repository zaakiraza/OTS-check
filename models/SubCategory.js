"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    static associate(models) {
      // Define associations
      SubCategory.belongsTo(models.Category, { foreignKey: 'categoryId' });
      SubCategory.hasMany(models.Subject, { foreignKey: 'subcategoryId' });
    }
  }

  SubCategory.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id',
        }
      },
    },
    {
      sequelize,
      modelName: "SubCategory",
    }
  );

  return SubCategory;
}; 