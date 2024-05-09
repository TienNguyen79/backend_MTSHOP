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

    await queryInterface.bulkDelete("Categories", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE Categories AUTO_INCREMENT = 1;"
    );

    const Categories = [];

    for (let i = 0; i < 10; i++) {
      Categories.push({
        parentId: i < 4 ? null : Math.floor(Math.random() * 4) + 1,
        url: faker.image.url(),
        name: faker.lorem.word({
          length: { min: 5, max: 7 },
          strategy: "fail",
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }

    return queryInterface.bulkInsert("Categories", Categories);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Categories", null, {});
  },
};
