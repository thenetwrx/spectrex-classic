import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject non-admins
  if (!event.context.user?.admin) {
    setResponseStatus(event, 403);
    return { message: "Unauthorized", result: null };
  }

  // 2. Edit server
  try {
    const servers = await db
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
        banned: servers_table.banned,
        approved_at: servers_table.approved_at,
        bumped_at: servers_table.bumped_at,
        pending: servers_table.pending,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned from Spectrex" };
    }

    const now = Date.now();

    await db
      .update(servers_table)
      .set({
        pending: false,
        updated_at: now,
        rejected: true,
        approved_at: null,
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
