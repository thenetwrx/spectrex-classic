import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (body.tags?.length > 5) {
    setResponseStatus(event, 400);
    return { message: "You already have too many tags (max of 5)" };
  }
  for (let i = 0; i < body.tags.length; i++) {
    if (contains_urls(body.tags[i])) {
      setResponseStatus(event, 400);
      return {
        message: `Tag #${i + 1} contains a link, please review our guidelines`,
      };
    }
    if (contains_profanity(body.tags[i])) {
      setResponseStatus(event, 400);
      return {
        message: `Tag #${
          i + 1
        } contains profanity, please review our guidelines`,
      };
    }
    if (body.tags[i].length > 16) {
      setResponseStatus(event, 400);
      return { message: `Tag #${i + 1} is too long (max of 16 characters)` };
    }
  }

  // 2. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "You must be logged in to do that" };
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
        pending: servers_table.pending,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "That server doesn't seem to exist" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: "You don't have permission to edit this server" };
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

    await db
      .update(servers_table)
      .set({
        tags: body.tags || [],
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
