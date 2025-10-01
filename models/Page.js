'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Page extends Model {
        static associate(models) {
            // Define any associations if needed, though not required here
        }
    }

    Page.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,  // Ensure title is unique (e.g., "Privacy Policy" and "Terms & Conditions")
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,  // Content should be provided
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,  // Slug should be unique
            },
        },
        {
            sequelize,
            modelName: 'Page',
            tableName: 'pages',  // Table name in the database
        }
    );

    return Page;
};
