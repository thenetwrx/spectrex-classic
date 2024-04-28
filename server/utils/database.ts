import Postgres from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const pool = new Postgres.Pool({
  user: "postgres",
  host: "localhost",
  database: "spectrex",
  password: "gDvQ514UXzUiDwa6",
  port: 5432,
});
const db = drizzle(pool, { schema });

export default db;
