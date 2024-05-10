"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      News.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });

      News.hasMany(models.NewsComment, {
        foreignKey: "newsId",
      });
    }
  }
  News.init(
    {
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      content: DataTypes.TEXT,
      categoryId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "News",
    }
  );
  return News;
};
