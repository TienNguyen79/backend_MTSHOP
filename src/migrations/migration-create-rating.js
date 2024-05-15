"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Ratings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.TEXT,
      },
      rate: {
        type: Sequelize.ENUM,
        values: ["1", "2", "3", "4", "5"],
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Ratings");
  },
};
