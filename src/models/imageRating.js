"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ImageRating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ImageRating.belongsTo(models.Rating, {
        foreignKey: "rateId",
      });
    }
  }
  ImageRating.init(
    {
      url: DataTypes.STRING,
      rateId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ImageRating",
    }
  );
  return ImageRating;
};
