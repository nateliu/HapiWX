import {DataTypes, Model} from 'sequelize';
import sequelize from '.';

class Shop extends Model {
    public id!: number;
    public name!: string;
    public thumb_url!: string;
}

Shop.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        thumb_url: DataTypes.STRING,
    },
    {
        tableName: 'shops',
        sequelize,
    },
);

export default Shop;
