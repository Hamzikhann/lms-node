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

		await queryInterface.bulkInsert(
			"userDepartments",
			[
				{ title: "Accounting", createdAt: date, updatedAt: date },
				{ title: "Administration", createdAt: date, updatedAt: date },
				{ title: "Compliance and Regulatory Affairs", createdAt: date, updatedAt: date },
				{ title: "Customer Service", createdAt: date, updatedAt: date },
				{ title: "Customer Support", createdAt: date, updatedAt: date },
				{ title: "Design and Creative Services", createdAt: date, updatedAt: date },
				{ title: "Engineering", createdAt: date, updatedAt: date },
				{ title: "Finance", createdAt: date, updatedAt: date },
				{ title: "Facilities Management", createdAt: date, updatedAt: date },
				{ title: "Human Resources (HR)", createdAt: date, updatedAt: date },
				{ title: "Information Technology (IT)", createdAt: date, updatedAt: date },
				{ title: "Legal", createdAt: date, updatedAt: date },
				{ title: "Logistics", createdAt: date, updatedAt: date },
				{ title: "Manufacturing", createdAt: date, updatedAt: date },
				{ title: "Marketing", createdAt: date, updatedAt: date },
				{ title: "Operations", createdAt: date, updatedAt: date },
				{ title: "Procurement", createdAt: date, updatedAt: date },
				{ title: "Product Management", createdAt: date, updatedAt: date },
				{ title: "Project Management", createdAt: date, updatedAt: date },
				{ title: "Public Relations (PR)", createdAt: date, updatedAt: date },
				{ title: "Quality Assurance (QA)", createdAt: date, updatedAt: date },
				{ title: "Research and Development (R&D)", createdAt: date, updatedAt: date },
				{ title: "Sales", createdAt: date, updatedAt: date },
				{ title: "Supply Chain", createdAt: date, updatedAt: date }
			],
			{}
		);

		await queryInterface.bulkInsert(
			"userDesignations",
			[
				{ title: "Accountant", createdAt: date, updatedAt: date },
				{ title: "Administrative Assistant", createdAt: date, updatedAt: date },
				{ title: "Architect", createdAt: date, updatedAt: date },
				{ title: "Chemical Engineer", createdAt: date, updatedAt: date },
				{ title: "Civil Engineer", createdAt: date, updatedAt: date },
				{ title: "Compliance and Regulatory Affairs", createdAt: date, updatedAt: date },
				{ title: "Customer Service Representative", createdAt: date, updatedAt: date },
				{ title: "Data Analyst", createdAt: date, updatedAt: date },
				{ title: "Data Scientist", createdAt: date, updatedAt: date },
				{ title: "Dental Hygienist", createdAt: date, updatedAt: date },
				{ title: "Dentist", createdAt: date, updatedAt: date },
				{ title: "Digital Marketing Specialist", createdAt: date, updatedAt: date },
				{ title: "Electrical Engineer", createdAt: date, updatedAt: date },
				{ title: "Executive Assistant", createdAt: date, updatedAt: date },
				{ title: "Financial Advisor", createdAt: date, updatedAt: date },
				{ title: "Financial Analyst", createdAt: date, updatedAt: date },
				{ title: "Graphic Designer", createdAt: date, updatedAt: date },
				{ title: "Human Resources Assistant", createdAt: date, updatedAt: date },
				{ title: "Human Resources Manager", createdAt: date, updatedAt: date },
				{ title: "Legal Assistant", createdAt: date, updatedAt: date },
				{ title: "Marketing Manager", createdAt: date, updatedAt: date },
				{ title: "Mechanical Engineer", createdAt: date, updatedAt: date },
				{ title: "Network Administrator", createdAt: date, updatedAt: date },
				{ title: "Operations Analyst", createdAt: date, updatedAt: date },
				{ title: "Operations Manager", createdAt: date, updatedAt: date },
				{ title: "Pharmacist", createdAt: date, updatedAt: date },
				{ title: "Physical Therapist", createdAt: date, updatedAt: date },
				{ title: "Physician Assistant", createdAt: date, updatedAt: date },
				{ title: "Product Manager", createdAt: date, updatedAt: date },
				{ title: "Project Manager", createdAt: date, updatedAt: date },
				{ title: "Quality Assurance Analyst", createdAt: date, updatedAt: date },
				{ title: "Sales Manager", createdAt: date, updatedAt: date },
				{ title: "Software Engineer", createdAt: date, updatedAt: date },
				{ title: "Systems Administrator", createdAt: date, updatedAt: date },
				{ title: "Teacher", createdAt: date, updatedAt: date },
				{ title: "Web Developer", createdAt: date, updatedAt: date },
				{ title: "UX Designer", createdAt: date, updatedAt: date },
				{ title: "Chemist", createdAt: date, updatedAt: date },
				{ title: "Biomedical Engineer", createdAt: date, updatedAt: date },
				{ title: "Mechanical Designer", createdAt: date, updatedAt: date },
				{ title: "Environmental Scientist", createdAt: date, updatedAt: date },
				{ title: "Business Analyst", createdAt: date, updatedAt: date },
				{ title: "Marketing Specialist", createdAt: date, updatedAt: date },
				{ title: "Product Designer", createdAt: date, updatedAt: date },
				{ title: "Registered Nurse", createdAt: date, updatedAt: date },
				{ title: "Research Scientist", createdAt: date, updatedAt: date }
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
