import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "You must be logged in to do that", result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Fetch servers for Dashboard
  try {
    const servers = await db
      .select()
      .from(servers_table)
      .where(eq(servers_table.owner_id, event.context.user.id));

    if (event.context.user.premium_since === null)
      for (let i = 0; i < servers.length; i++) servers[i].invite_uses = null;

    setResponseStatus(event, 200);
    return {
      message: null,
      result: servers,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
