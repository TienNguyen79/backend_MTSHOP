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

    await queryInterface.bulkDelete("PaymentMethodUsers", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE PaymentMethodUsers AUTO_INCREMENT = 1;"
    );

    const PaymentMethodUsers = [];

    for (let i = 0; i < 10; i++) {
      PaymentMethodUsers.push({
        systemId: Math.floor(Math.random() * 2) + 1,
        userId: Math.floor(Math.random() * 10) + 1,
        cardNumber: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("PaymentMethodUsers", PaymentMethodUsers);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("PaymentMethodUsers", null, {});
  },
};
