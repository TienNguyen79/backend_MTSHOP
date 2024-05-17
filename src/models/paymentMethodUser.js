"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PaymentMethodUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PaymentMethodUser.belongsTo(models.PaymentMethodSystem, {
        foreignKey: "systemId",
      });

      PaymentMethodUser.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  PaymentMethodUser.init(
    {
      systemId: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      cardNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PaymentMethodUser",
    }
  );
  return PaymentMethodUser;
};
