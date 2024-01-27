'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        queryInterface.createTable('order_goods', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            goods_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            single_price: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        queryInterface.dropTable('order_goods');
    },
};
