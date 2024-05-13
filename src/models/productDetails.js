"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ProductDetails.hasMany(models.ProductImage, {
      //   foreignKey: "productVariantId",
      // });

      // ProductDetails.belongsTo(models.AttributeValue, {
      //   foreignKey: "attributeValueId",
      // });

      ProductDetails.belongsTo(models.Product, {
        foreignKey: "productId",
      });
    }
  }
  ProductDetails.init(
    {
      productId: DataTypes.INTEGER,
      // attributeValueId: DataTypes.INTEGER,
      properties: DataTypes.JSON,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ProductDetails",
    }
  );
  return ProductDetails;
};
