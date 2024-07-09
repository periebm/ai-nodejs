import pg from "pg"
import dotenv from "dotenv"
import { envConfig } from "./config"
dotenv.config()

const { Pool } = pg

const configDatabase = {
  connectionString: envConfig.database.connectionString
}

/* if (process.env.MODE === "prod") configDatabase.ssl = true
 */
export const db = new Pool(configDatabase)