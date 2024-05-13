"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AttributeValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AttributeValue.belongsTo(models.Attribute, {
        foreignKey: "attributeId",
      });
      // AttributeValue.hasMany(models.ProductDetails, {
      //   foreignKey: "attributeValueId",
      // });
    }
  }
  AttributeValue.init(
    {
      attributeId: DataTypes.INTEGER,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "AttributeValue",
    }
  );
  return AttributeValue;
};
