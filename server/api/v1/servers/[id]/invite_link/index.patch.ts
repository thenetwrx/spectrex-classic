import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (!body.invite_link?.length) {
    setResponseStatus(event, 400);
    return { message: "Invite link must not be empty" };
  }
  if (
    !["https://discord.gg/", "https://discord.com/invite/"].some((prefix) =>
      body.invite_link.startsWith(prefix)
    )
  ) {
    setResponseStatus(event, 400);
    return {
      message: "Invite link is not valid, it must be a Discord invite link",
    };
  }
  if (body.invite_link.length >= 128) {
    setResponseStatus(event, 400);
    return { message: "Invite link has too many characters (max of 128)" };
  }

  // 2. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex" };
  }

  // 3. Edit server
  try {
    const servers = await db
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
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
    if (servers[0].approved_at === null) {
      setResponseStatus(event, 403);
      return { message: "Server is not approved" };
    }

    await db
      .update(servers_table)
      .set({
        invite_link: body.invite_link,
        updated_at: Date.now(),
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
