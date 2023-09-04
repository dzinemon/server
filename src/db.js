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
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  // port: 5432
}

const pool = new Pool(useLocal ? poolConfigLocal : poolConfigVercel)

export default pool
