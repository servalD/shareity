import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import { Event } from './event.model';

export class Ticket extends Model {
    public id!: number;
    public eventId!: number;
    public buyerAddress!: string;
    public totalAmount!: number;
    public nftTokenId?: string;
    public transactionHash?: string;
    public createdAt!: Date;
}

Ticket.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'event',
            key: 'id'
        }
    },
    buyerAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    nftTokenId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transactionHash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'ticket',
    timestamps: false
});

// Définir la relation avec Event
Ticket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Ticket, { foreignKey: 'eventId', as: 'tickets' }); 