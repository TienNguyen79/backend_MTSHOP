"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Attribute.hasMany(models.AttributeValue, {
        foreignKey: "attributeId",
      });
      Attribute.hasMany(models.VariantAttributeValue, {
        foreignKey: "attributeId",
      });
    }
  }
  Attribute.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Attribute",
    }
  );
  return Attribute;
};
