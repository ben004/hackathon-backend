import * as dotenv from 'dotenv';

dotenv.config();

export const DB_CREDENTIAL = {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
}