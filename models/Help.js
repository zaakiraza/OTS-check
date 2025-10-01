'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Help extends Model {
        // No associations required
    }

    Help.init(
        {
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,  // First name is required
            },
            emailAddress: {
                type: DataTypes.STRING,
                allowNull: false,  // Email address is required
                validate: {
                    isEmail: true,  // Validate that the email is in the correct format
                },
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,  // Phone number is optional
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,  // Message is required
            },
            whereDidYouFindUs: {
                type: DataTypes.STRING,
                allowNull: true,  // Optional field
            },
        },
        {
            sequelize,
            modelName: 'Help',
            tableName: 'Helps',  // Explicitly set the table name to "helps"
        }
    );

    return Help;
};