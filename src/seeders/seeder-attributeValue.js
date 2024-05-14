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

    await queryInterface.bulkDelete("attributeValues", null, {});

    await queryInterface.sequelize.query(
      "ALTER TABLE attributeValues AUTO_INCREMENT = 1;"
    );

    const Arrinit = [];
    const arrsize = ["s", "xs", "m", "l", "xl", "xxl"];
    const arrColor = ["black", "grey", "white", "blue", "red"];

    for (let i = 0; i <= arrsize.length - 1; i++) {
      Arrinit.push({
        attributeId: 1,
        description: arrsize[i],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    for (let i = 0; i <= arrColor.length - 1; i++) {
      Arrinit.push({
        attributeId: 2,
        description: arrColor[i],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("attributeValues", Arrinit);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("attributeValues", null, {});
  },
};
