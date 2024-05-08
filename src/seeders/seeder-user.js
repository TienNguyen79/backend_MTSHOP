("use strict");

const bcrypt = require("bcrypt");
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

    function generateVietnamesePhoneNumber() {
      const prefix = "0" + Math.floor(Math.random() * 9 + 1); // Đầu số điện thoại Việt Nam bắt đầu từ 0 và theo sau bởi 1 số từ 1-9
      const remainingDigits = Array.from({ length: 9 }, () =>
        Math.floor(Math.random() * 10)
      ).join(""); // 9 chữ số còn lại
      return prefix + remainingDigits;
    }

    await queryInterface.bulkDelete("Users", null, {});

    // Đặt lại trình tự tăng tự động cho trường ID
    await queryInterface.sequelize.query(
      "ALTER TABLE Users AUTO_INCREMENT = 1;"
    );

    const salt = await bcrypt.genSalt(10);
    const Passhashed = await bcrypt.hash("123456", salt);
    const users = [];

    for (let i = 0; i < 10; i++) {
      users.push({
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        password: Passhashed,
        phoneNumber: generateVietnamesePhoneNumber(),
        roleID: Math.floor(Math.random() * 2) + 1,
        status: Math.random() > 0.5 ? 1 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("Users", users);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // return queryInterface.bulkDelete("Users", null, {});
  },
};
