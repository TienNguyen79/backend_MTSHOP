"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PaymentMethodSystem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PaymentMethodSystem.hasMany(models.PaymentMethodUser, {
        foreignKey: "systemId",
      });
    }
  }
  PaymentMethodSystem.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PaymentMethodSystem",
    }
  );
  return PaymentMethodSystem;
};
