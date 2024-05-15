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

    await queryInterface.bulkDelete("Ratings", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE Ratings AUTO_INCREMENT = 1;"
    );

    const Ratings = [];

    for (let i = 0; i < 30; i++) {
      Ratings.push({
        userId: Math.floor(Math.random() * 8) + 1,
        productId: Math.floor(Math.random() * 30) + 1,
        orderId: Math.floor(Math.random() * 10) + 1,
        description: faker.lorem.paragraphs(),
        rate: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("Ratings", Ratings);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Ratings", null, {});
  },
};
