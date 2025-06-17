import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import { Cause } from './cause.model';

export class Event extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public date!: Date;
    public city!: string;
    public country!: string;
    public maxAttendees!: number;
    public attendees!: number;
    public ticketPrice!: number;
    public imageUrl!: string;
    public causeId!: number;
}

Event.init({
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
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    maxAttendees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    attendees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ticketPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    causeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cause',
            key: 'id'
        }
    }
}, {
    sequelize,
    tableName: 'event',
    timestamps: false
});

// Définir la relation avec Cause
Event.belongsTo(Cause, { foreignKey: 'causeId', as: 'cause' });
Cause.hasMany(Event, { foreignKey: 'causeId', as: 'events' }); 