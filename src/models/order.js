"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "userId" });

      Order.belongsTo(models.Address, { foreignKey: "addressId" });

      Order.hasMany(models.OrderDetails, { foreignKey: "orderId" });
    }
  }
  Order.init(
    {
      userId: DataTypes.INTEGER,
      addressId: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      shippingfee: DataTypes.INTEGER,
      orderState: DataTypes.ENUM("0", "1", "2", "3", "4", "5"),
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
