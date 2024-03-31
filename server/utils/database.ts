import Postgres from "pg";
import fs from "fs";

const client = new Postgres.Client({
  host: "aws-0-us-east-1.pooler.supabase.com",
  database: "postgres",
  port: 5432,
  user: "postgres.qpvredklgeepeyxvjgch",
  password: "gDvQ514UXzUiDwa6",
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certs/prod-ca-2021.crt").toString(),
  },
});

client.connect();

export default client;
