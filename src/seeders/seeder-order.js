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

    await queryInterface.bulkDelete("Orders", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE Orders AUTO_INCREMENT = 1;"
    );

    const Orders = [];
    const orderState = ["0", "1", "2", "3", "4", "5"];

    for (let i = 0; i < 30; i++) {
      Orders.push({
        userId: Math.floor(Math.random() * 10) + 1,
        addressId: Math.floor(Math.random() * 10) + 1,
        total: 500000,
        shippingfee: 0,
        OrderState: orderState[Math.floor(Math.random() * 6)],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("Orders", Orders);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Orders", null, {});
  },
};
