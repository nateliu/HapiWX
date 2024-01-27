
import { Sequelize } from 'sequelize';


const env = process.env.NODE_ENV || 'development';

const config = require('../config/config.json')[env];
config.define = {
    underscored: true,
};

const sequelize =  new Sequelize(config.database, config.username, config.password, config);

export default sequelize;
