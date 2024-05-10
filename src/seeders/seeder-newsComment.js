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

    await queryInterface.bulkDelete("NewsComments", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE NewsComments AUTO_INCREMENT = 1;"
    );

    const NewsComments = [];

    for (let i = 0; i < 10; i++) {
      NewsComments.push({
        content: faker.lorem.lines(1),
        newsId: Math.floor(Math.random() * 8) + 1,
        userId: Math.floor(Math.random() * 8) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("NewsComments", NewsComments);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("NewsComments", null, {});
  },
};
