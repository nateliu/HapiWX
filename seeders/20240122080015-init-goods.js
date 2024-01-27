'use strict';

const timestamps = {
    created_at: new Date(),
    updated_at: new Date(),
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
        queryInterface.bulkInsert(
            'goods',
            [
                {id: 1, shop_id: '1', name: 'good1', thumb_url: 'g1.png', ...timestamps},
                {id: 2, shop_id: '1', name: 'good2', thumb_url: 'g2.png', ...timestamps},
                {id: 3, shop_id: '1', name: 'good3', thumb_url: 'g3.png', ...timestamps},
                {id: 4, shop_id: '1', name: 'good4', thumb_url: 'g4.png', ...timestamps},
            ],
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        const {Op} = Sequelize;
        // delete shopId in [1，2，3，4]
        return queryInterface.bulkDelete('goods', {id: {[Op.in]: [1, 2, 3, 4]}}, {});
    },
};
