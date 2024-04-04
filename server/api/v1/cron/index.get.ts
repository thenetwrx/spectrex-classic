import pool from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  if (getHeader(event, "Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return event.node.res.writeHead(403).end();

  const client = await pool.connect();
  try {
    await client.query(`
        DELETE FROM sessions 
        WHERE expires_at < NOW()
    `);

    client.release();

    return;
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  } finally {
  }
});
