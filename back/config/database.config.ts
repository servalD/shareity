import { Sequelize } from 'sequelize';
import { config } from 'dotenv'
config();

const sequelize = new Sequelize('Chariety', process.env.DATABASE_USERNAME as string, process.env.DATABASE_PASSWORD, {
    host: process.env.HOST,
    port: Number(process.env.DATABASE_PORT),
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 10000,
        // socketPath: '/home/gaetan/Documents/ESGI/XRPL/shareity/back/mysqld.sock',
    },
});

export default sequelize;
