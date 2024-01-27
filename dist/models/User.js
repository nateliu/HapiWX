"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = __importDefault(require("."));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    nick_name: sequelize_1.DataTypes.STRING,
    avatar_url: sequelize_1.DataTypes.STRING,
    gender: sequelize_1.DataTypes.INTEGER,
    open_id: sequelize_1.DataTypes.STRING,
    session_key: sequelize_1.DataTypes.STRING,
}, {
    tableName: 'users',
    sequelize: _1.default,
});
exports.default = User;
