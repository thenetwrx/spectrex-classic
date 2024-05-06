import db from "~/server/utils/database";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject non-admins
  if (!event.context.user?.admin) {
    setResponseStatus(event, 403);
    return { message: "You must be an admin to do this", result: null };
  }

  // 2. Fetch users
  try {
    const servers = await db
      .select()
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "That server doesn't seem to exist", result: null };
    }

    setResponseStatus(event, 200);
    return {
      message: null,
      result: servers[0],
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
