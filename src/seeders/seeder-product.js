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

    await queryInterface.bulkDelete("Products", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE Products AUTO_INCREMENT = 1;"
    );

    const Products = [];

    for (let i = 0; i < 50; i++) {
      const price = (Math.floor(Math.random() * (1000 - 1 + 1)) + 1) * 1000; //tạo số ngẫu nhiên trong khoảng từ 1 đến 1000, sau đó nhân nó với 1000
      const discount = Math.floor(Math.random() * 99) + 1;
      const total = Math.floor((price * (100 - discount)) / 100);
      Products.push({
        name: faker.lorem.word({
          length: { min: 10, max: 30 },
          strategy: "fail",
        }),
        categoryId: Math.floor(Math.random() * 8) + 1,
        description: faker.lorem.paragraphs(Math.floor(Math.random() * 5) + 1),
        price: price,
        discount: discount,
        total: total,
        sold: Math.floor(Math.random() * 100),
        createdAt: new Date(),
        updatedAt: new Date(),
        // deletedAt: null,
      });
    }

    return queryInterface.bulkInsert("Products", Products);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Products", null, {});
  },
};
