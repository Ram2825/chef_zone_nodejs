import mysql from "mysql";

export const db = mysql.createPool({
    connectionLimit: 100,
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: 'H@cker22',
    database: 'chef_zone'
})







