"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Faq extends Model {
        static associate(models) {
            // Define associations here if needed
        }
    }

    Faq.init(
        {
            question: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            answer: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Faq",
            tableName: "FAQs"
        }
    );

    return Faq;
};
