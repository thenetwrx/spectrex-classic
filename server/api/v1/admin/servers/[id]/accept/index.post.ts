import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject non-admins
  if (!event.context.user?.admin) {
    setResponseStatus(event, 403);
    return { message: "You must be an admin to do this", result: null };
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
      return { message: "That server doesn't seem to exist" };
    }

    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned from Spectrex" };
    }
    if (servers[0].approved_at !== null) {
      setResponseStatus(event, 403);
      return { message: "Server is already approved" };
    }

    const now = Date.now();

    await db
      .update(servers_table)
      .set({
        approved_at: now,
        pending: false,
        updated_at: now,
        bumped_at: servers[0].bumped_at === null ? now : servers[0].bumped_at,
        rejected: false,
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
