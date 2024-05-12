"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ProductVariant.hasMany(models.ProductImage, {
      //   foreignKey: "productVariantId",
      // });

      ProductVariant.hasMany(models.VariantAttributeValue, {
        foreignKey: "productVariantId",
      });

      ProductVariant.belongsTo(models.Product, {
        foreignKey: "productId",
      });
    }
  }
  ProductVariant.init(
    {
      productId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      sold: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ProductVariant",
    }
  );
  return ProductVariant;
};
