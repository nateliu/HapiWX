import {DataTypes, Model} from 'sequelize';
import sequelize from '.';

class Good extends Model {
    public id!: number;
    public shop_id!: number;
    public name!: string;
    public thumb_url!: string;
}

Good.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        thumb_url: DataTypes.STRING,
    },
    {
        tableName: 'goods',
        sequelize,
    },
);

export default Good;
