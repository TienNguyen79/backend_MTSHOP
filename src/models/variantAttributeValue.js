"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VariantAttributeValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VariantAttributeValue.belongsTo(models.Attribute, {
        foreignKey: "attributeId",
      });
      VariantAttributeValue.belongsTo(models.AttributeValue, {
        foreignKey: "attributeValueId",
      });
      VariantAttributeValue.belongsTo(models.ProductVariant, {
        foreignKey: "productVariantId",
      });
    }
  }
  VariantAttributeValue.init(
    {
      attributeId: DataTypes.INTEGER,
      productVariantId: DataTypes.INTEGER,
      attributeValueId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "VariantAttributeValue",
    }
  );
  return VariantAttributeValue;
};
