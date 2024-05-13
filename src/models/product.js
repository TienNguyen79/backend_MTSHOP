"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.hasMany(models.ProductDetails, {
        foreignKey: "productId",
      });
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
      });

      Product.hasMany(models.ProductImage, {
        foreignKey: "productId",
        as: "image",
      });
    }
  }
  Product.init(
    {
      name: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL(12, 3),
      discount: DataTypes.INTEGER,
      total: DataTypes.DECIMAL(12, 3),
      sold: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
