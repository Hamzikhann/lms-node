"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const date = new Date();

		await queryInterface.bulkInsert(
			"roles",
			[
				{ title: "Administrator", createdAt: date, updatedAt: date },
				{ title: "Client", createdAt: date, updatedAt: date },
				{ title: "User", createdAt: date, updatedAt: date }
			],
			{}
		);

		await queryInterface.bulkInsert(
			"users",
			[
				{
					firstName: "Admin",
					lastName: "Account",
					email: "admin@lms.com",
					password: "lms",
					roleId: "1",
					createdAt: date,
					updatedAt: date
				}
			],
			{}
		);

		await queryInterface.bulkInsert("userProfiles", [{ userId: "1", createdAt: date, updatedAt: date }], {});

		await queryInterface.bulkInsert(
			"courseTaskTypes",
			[
				{ title: "Assessment", createdAt: date, updatedAt: date },
				{ title: "Reading", createdAt: date, updatedAt: date },
				{ title: "Video", createdAt: date, updatedAt: date }
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("roles", null, {});
		await queryInterface.bulkDelete("users", null, {});
		await queryInterface.bulkDelete("userProfiles", null, {});
		await queryInterface.bulkDelete("courseTaskTypes", null, {});
	}
};
