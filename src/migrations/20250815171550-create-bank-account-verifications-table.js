'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize
      .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      .then(async () => {
        await queryInterface.createTable('BankAccountVerifications', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            primaryKey: true,
            allowNull: false,
          },
          accountHolderName: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          accountNumber: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          ifscCode: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          provider: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          status: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        });
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BankAccountVerifications');
  },
};
