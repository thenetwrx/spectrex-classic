import db from "~/server/utils/database";
import { sql, lt } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  if (getHeader(event, "Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return event.node.res.writeHead(403).end();

  try {
    await db
      .delete(sessions_table)
      .where(lt(sessions_table.expiresAt, sql`now()`));

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
