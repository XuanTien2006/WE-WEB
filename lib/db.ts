import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "clock_user",
      password: process.env.MYSQL_PASSWORD || "your_password",
      database: process.env.MYSQL_DATABASE || "clock_app",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })
  }
  return pool
}

export default getPool()
