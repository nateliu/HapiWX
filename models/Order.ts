import {DataTypes, Model} from 'sequelize';
import sequelize from '.';

class Order extends Model {
    public id!: number;
    public user_id!: number;
    public payment_status!: string;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM('0', '1'), // 0 unpaied， 1 paid   defaultValue: '0',
        },
    },
    {
        tableName: 'orders',
        sequelize,
    },
);

export default Order;
