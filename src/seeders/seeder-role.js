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

    await queryInterface.bulkDelete("Roles", null, {});

    await queryInterface.sequelize.query(
      "ALTER TABLE Roles AUTO_INCREMENT = 1;"
    );

    return queryInterface.bulkInsert("Roles", [
      {
        title: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "admin",
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
    return queryInterface.bulkDelete("Roles", null, {});
  },
};
