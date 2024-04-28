import Postgres from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const pool = new Postgres.Pool({
  user: "postgres",
  host: process.env.DATABASE_HOST,
  database: "spectrex",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
const db = drizzle(pool, { schema });

export default db;
