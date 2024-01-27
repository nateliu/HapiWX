import {DataTypes, Model} from 'sequelize';
import sequelize from '.';

class OrderGood extends Model {
    public id!: number;
    public order_id!: number;
    public goods_id!: number;
    public single_price!: number;
    public count!: number;
}

OrderGood.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        goods_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        single_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'order_goods',
        sequelize,
    },
);

export default OrderGood;
