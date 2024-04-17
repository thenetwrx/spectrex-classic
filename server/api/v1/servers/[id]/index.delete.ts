import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex" };
  }

  // 2. Edit server
  try {
    const servers = await db
      .select({
        id: servers_table.id,
        owner_id: servers_table.id,
        banned: servers_table.banned,
        approved_at: servers_table.approved_at,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: "Unauthorized" };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned from Spectrex" };
    }
    if (!servers[0].approved_at) {
      setResponseStatus(event, 403);
      return { message: "Server is not approved" };
    }

    const now = Date.now().toString();

    await db
      .update(servers_table)
      .set({
        approved_at: null,
        public: false,
        language: null,
        category: null,
        tags: [],
        description: null,
        invite_link: null,
        nsfw: false,
        updated_at: now,
      })
      .where(eq(servers_table.id, servers[0].id));

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
