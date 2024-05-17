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

    await queryInterface.bulkDelete("Address", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE Address AUTO_INCREMENT = 1;"
    );

    const Address = [];

    for (let i = 0; i < 30; i++) {
      Address.push({
        address: faker.lorem.paragraph(),
        userId: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("Address", Address);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Address", null, {});
  },
};
