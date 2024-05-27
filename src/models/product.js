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

      Product.hasMany(models.Rating, {
        foreignKey: "productId",
      });
    }
  }
  Product.init(
    {
      name: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      price: DataTypes.INTEGER,
      discount: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      sold: DataTypes.INTEGER,
      averageRating: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
      paranoid: true, // Kích hoạt chế độ paranoid để sử dụng soft delete
    }
  );
  return Product;
};
