'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { title: 'Administrator' },
      { title: 'Client' },
      { title: 'User' },
    ], {});

    await queryInterface.bulkInsert('users', [
      { firstName: "Admin", lastName: "Account", email: "admin@lms.com", password: "lms", roleId: '1' },
    ], {});

    await queryInterface.bulkInsert('userProfiles', [
      { userId: '1' },
    ], {});

    await queryInterface.bulkInsert('courseTaskTypes', [
      { title: 'Assessment' },
      { title: 'Reading' },
      { title: 'Video' }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('userProfiles', null, {});
    await queryInterface.bulkDelete('courseTaskTypes', null, {});
  }
};
