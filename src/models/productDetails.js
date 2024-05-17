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
      ProductDetails.belongsTo(models.Product, {
        foreignKey: "productId",
      });

      ProductDetails.hasMany(models.Cart, {
        foreignKey: "productDetailsId",
      });

      ProductDetails.hasMany(models.OrderDetails, {
        foreignKey: "productDetailsId",
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
