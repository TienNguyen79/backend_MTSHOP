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

    await queryInterface.bulkDelete("Attributes", null, {});

    await queryInterface.sequelize.query(
      "ALTER TABLE Attributes AUTO_INCREMENT = 1;"
    );

    return queryInterface.bulkInsert("Attributes", [
      {
        name: "size",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "color",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "material",
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
    return queryInterface.bulkDelete("Attributes", null, {});
  },
};
