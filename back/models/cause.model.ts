import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';

export class Cause extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public location!: string;
    public addressDestination!: string;
    public imageUrl!: string;
    public raisedAmount!: number;
    public goal!: number;
    public supporters!: number;
    public isClosed!: boolean;
}

Cause.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    addressDestination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    raisedAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    goal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    supporters: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isClosed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    tableName: 'cause',
    timestamps: false
});
