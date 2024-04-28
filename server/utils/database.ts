import Postgres from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const pool = new Postgres.Pool({
  host: "localhost",
  database: "spectrex",
  port: 5432,
  user: "postgres",
  password: "gDvQ514UXzUiDwa6",
});
const db = drizzle(pool, { schema });

export default db;
