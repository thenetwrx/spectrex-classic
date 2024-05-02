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

    if (servers[0].owner_id !== event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: "Unauthorized" };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned from Spectrex" };
    }
    if (servers[0].pending) {
      setResponseStatus(event, 403);
      return { message: "Server is pending approval" };
    }
    if (servers[0].approved_at === null) {
      setResponseStatus(event, 403);
      return { message: "Server is not approved" };
    }

    // Compare the timestamps
    const now = Date.now();
    const cooldown =
      event.context.user.premium_since !== null ? 3600000 : 7200000;
    if (servers[0].bumped_at! + cooldown <= now) {
      await db
        .update(servers_table)
        .set({ bumped_at: now, updated_at: now })
        .where(eq(servers_table.id, servers[0].id));

      return;
    }

    const timeLeftMilliseconds = now - servers[0].bumped_at! - cooldown;
    const timeLeftMessage = `Bump is on cooldown`;

    setResponseStatus(event, 403);
    return {
      message: timeLeftMessage,
      timeLeft: timeLeftMilliseconds,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
