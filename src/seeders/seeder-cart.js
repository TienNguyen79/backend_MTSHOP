"use strict";

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

    await queryInterface.bulkDelete("Carts", null, {});

    await queryInterface.sequelize.query(
      "ALTER TABLE Carts AUTO_INCREMENT = 1;"
    );

    const Carts = [];

    for (let i = 0; i < 30; i++) {
      Carts.push({
        userId: Math.floor(Math.random() * 10) + 1,
        productDetailsId: Math.floor(Math.random() * 20) + 1,
        quantity: Math.floor(Math.random() * 6) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("Carts", Carts);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("Carts", null, {});
  },
};
