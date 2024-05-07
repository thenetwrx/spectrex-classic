import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: generic_error_not_logged_in, result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned, result: null };
  }

  // 2. Fetch servers for Dashboard
  try {
    const servers = await database
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
      message: generic_error_unknown_error,
      result: null,
    };
  }
});
