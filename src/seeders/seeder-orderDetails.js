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

    await queryInterface.bulkDelete("OrderDetails", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE OrderDetails AUTO_INCREMENT = 1;"
    );

    const OrderDetails = [];

    for (let i = 0; i < 30; i++) {
      let quantity = Math.floor(Math.random() * 30) + 1;
      let price = (Math.floor(Math.random() * (1000 - 1 + 1)) + 1) * 1000;
      OrderDetails.push({
        orderId: Math.floor(Math.random() * 10) + 1,
        productDetailsId: Math.floor(Math.random() * 30) + 1,
        quantity: quantity,
        price: price,
        total: price * quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("OrderDetails", OrderDetails);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("OrderDetails", null, {});
  },
};
