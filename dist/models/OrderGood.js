"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = __importDefault(require("."));
class OrderGood extends sequelize_1.Model {
}
OrderGood.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    goods_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    single_price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'order_goods',
    sequelize: _1.default,
});
exports.default = OrderGood;
