"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NewsComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NewsComment.belongsTo(models.News, {
        foreignKey: "newsId",
      });

      NewsComment.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }
  NewsComment.init(
    {
      content: DataTypes.STRING,
      newsId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "NewsComment",
    }
  );
  return NewsComment;
};
