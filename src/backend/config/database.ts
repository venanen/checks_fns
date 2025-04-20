import mysql from 'mysql2/promise';
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER} from "./config";

export const pool = mysql.createPool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
});

