"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // // Mối quan hệ nhiều-1 với chính nó (mỗi danh mục có thể có một danh mục cha)
      // Category.belongsTo(models.Category, {
      //   foreignKey: "parentId",
      //   as: "parent",
      // });
      // // Mối quan hệ 1-n với chính nó (một danh mục cha có thể có nhiều danh mục con)
      // Category.hasMany(models.Category, {
      //   foreignKey: "parentId",
      //   as: "children",
      // });

      Category.hasMany(models.News, {
        foreignKey: "categoryId",
      });

      Category.hasMany(models.Product, {
        foreignKey: "categoryId",
      });
    }
  }
  Category.init(
    {
      parentId: DataTypes.INTEGER,
      url: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Category",
      paranoid: true, // Kích hoạt chế độ paranoid để sử dụng soft delete
    }
  );
  return Category;
};
