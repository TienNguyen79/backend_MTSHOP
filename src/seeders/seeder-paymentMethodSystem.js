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

    await queryInterface.bulkDelete("PaymentMethodSystems", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE PaymentMethodSystems AUTO_INCREMENT = 1;"
    );

    return queryInterface.bulkInsert("PaymentMethodSystems", [
      {
        name: "Thanh Toán khi nhận hàng",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "VN PAY",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("PaymentMethodSystems", null, {});
  },
};
