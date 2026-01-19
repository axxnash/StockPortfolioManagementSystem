const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "spms",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.code || err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('Database connection was closed.');
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') console.error('Database had a fatal error.');
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_CLOSE') console.error('Database connection was closed.');
});

module.exports = pool;
