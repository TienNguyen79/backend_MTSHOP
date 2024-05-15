"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rating.belongsTo(models.Product, {
        foreignKey: "productId",
      });

      Rating.hasMany(models.ImageRating, {
        foreignKey: "rateId",
      });
    }
  }
  Rating.init(
    {
      userId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      orderId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      rate: DataTypes.ENUM("1", "2", "3", "4", "5"),
    },
    {
      sequelize,
      modelName: "Rating",
    }
  );
  return Rating;
};
