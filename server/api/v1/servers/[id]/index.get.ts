import db from "~/server/utils/database";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Fetch guild
  try {
    const servers = await db
      .select()
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found", result: null };
    }

    if (!servers[0].public) {
      if (event.context.user?.id !== servers[0].owner_id) {
        setResponseStatus(event, 403);
        return { message: "Unauthorized", result: null };
      }
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned from Spectrex", result: null };
    }
    if (servers[0].approved_at === null) {
      if (event.context.user?.id !== servers[0].owner_id) {
        setResponseStatus(event, 403);
        return { message: "Server is not approved", result: null };
      }
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
