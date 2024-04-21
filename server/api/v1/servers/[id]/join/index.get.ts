import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Require being logged in
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex" };
  }

  // 2. Edit server
  try {
    const servers = await db
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
        public: servers_table.public,
        banned: servers_table.banned,
        approved_at: servers_table.approved_at,
        invite_link: servers_table.invite_link,
        invite_uses: servers_table.invite_uses,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
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

    servers[0].invite_uses.push({
      from_id: event.context.user?.id || "0",
      created_at: Date.now().toString(),
    });
    await db
      .update(servers_table)
      .set({
        invite_uses: servers[0].invite_uses,
      })
      .where(eq(servers_table.id, servers[0].id));

    return sendRedirect(event, servers[0].invite_link || "/");
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
