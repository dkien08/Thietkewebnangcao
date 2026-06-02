import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl:{
    rejectUnauthorized:false
  }
});

pool.getConnection()
    .then((connection) => {
        console.log('Kết nối MySQL Aiventhành công ');
        connection.release();
    })
    .catch((err) => {
        console.log('Chi tiet loi:');
        console.error(err);
    });

export default pool;