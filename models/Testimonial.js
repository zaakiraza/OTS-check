'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Testimonial extends Model {
        static associate(models) {
            // Define associations here if needed
        }
    }

    Testimonial.init(
        {
            text: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            img_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            designation: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            videoUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Testimonial',
        }
    );

    return Testimonial;
};
