import pg from "pg"
import dotenv from "dotenv"
import { envConfig } from "./config"
dotenv.config()

const { Pool } = pg

const configDatabase = {
  connectionString: envConfig.database.connectionString
}

export const closeDatabase = async () => {
  await database.end();
  console.log("Pool de conexões fechada.");
};

/* if (process.env.MODE === "prod") configDatabase.ssl = true
 */
export const database = new Pool(configDatabase)