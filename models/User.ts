import {DataTypes, Model} from 'sequelize';
import sequelize from '.';

class User extends Model {
    public id!: number;
    public nick_name!: string;
    public avatar_url!: string;
    public gender!: string;
    public open_id!: string;
    public session_key!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nick_name: DataTypes.STRING,
        avatar_url: DataTypes.STRING,
        gender: DataTypes.INTEGER,
        open_id: DataTypes.STRING,
        session_key: DataTypes.STRING,
    },
    {
        tableName: 'users',
        sequelize,
    },
);

export default User;
