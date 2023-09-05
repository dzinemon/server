import { Pool } from 'pg'

const useLocal = process.env.DB_TYPE === 'local'

const poolConfigLocal = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: 5432,
}

const poolConfigVercel = {
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
}

const pool = new Pool(useLocal ? poolConfigLocal : poolConfigVercel)

export default pool
