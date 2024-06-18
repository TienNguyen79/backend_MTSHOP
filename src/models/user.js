"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role, { foreignKey: "roleID" });

      User.hasMany(models.NewsComment, { foreignKey: "userId" });

      User.hasMany(models.Address, { foreignKey: "userId" });

      User.hasOne(models.Cart, { foreignKey: "userId" });

      User.hasMany(models.Order, { foreignKey: "userId" });

      User.hasMany(models.PaymentMethodUser, { foreignKey: "userId" });

      User.hasMany(models.Rating, { foreignKey: "userId" });

      User.hasOne(models.RefreshToken, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      userName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      avatar: DataTypes.STRING,
      roleID: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true, // Kích hoạt chế độ paranoid để sử dụng soft delete
    }
  );
  return User;
};
