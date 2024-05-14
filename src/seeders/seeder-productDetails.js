("use strict");

const { faker } = require("@faker-js/faker");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkDelete("ProductDetails", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE ProductDetails AUTO_INCREMENT = 1;"
    );

    const ProductDetails = [];

    for (let t = 0; t < 8; t++) {
      for (let i = 0; i < 6; i++) {
        ProductDetails.push({
          productId: t + 1,
          properties: JSON.stringify({
            size: Math.floor(Math.random() * 6) + 1, // random từ 1 -> 6
            color: Math.floor(Math.random() * 5) + 7, // random từ 7 -> 11
          }),
          quantity: Math.floor(Math.random() * 300) + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return queryInterface.bulkInsert("ProductDetails", ProductDetails);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("ProductDetails", null, {});
  },
};
