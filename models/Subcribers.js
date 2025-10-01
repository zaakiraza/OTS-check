"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Subscriber extends Model {
        static associate(models) {
            Subscriber.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    Subscriber.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users', // Assumes your users table is named 'Users'
                    key: 'id', // Reference the user ID
                },
                onDelete: 'SET NULL', // If the user is deleted, set userId to null
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, // Ensure email is unique
            },
            subscribe: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true, // Default to true (subscribed)
            },
        },
        {
            sequelize,
            modelName: "Subscriber",
        }
    );

    return Subscriber;
};
