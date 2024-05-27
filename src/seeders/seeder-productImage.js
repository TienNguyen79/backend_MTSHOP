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

    await queryInterface.bulkDelete("ProductImages", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE ProductImages AUTO_INCREMENT = 1;"
    );

    const ProductImages = [];

    for (let t = 0; t < 50; t++) {
      for (let i = 0; i < 6; i++) {
        ProductImages.push({
          default: i === 0 ? true : false,
          url: faker.image.url(),
          productId: t + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return queryInterface.bulkInsert("ProductImages", ProductImages);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("ProductImages", null, {});
  },
};
