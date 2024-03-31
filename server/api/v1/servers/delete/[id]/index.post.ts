import { type Server } from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_discord_id = params.id;

  // 1. Check logged in status to prevent spam
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned" };
  }

  // 2. Edit server
  try {
    const { rows: servers } = await database.query<Server>(
      `
      SELECT * FROM servers
      WHERE
        discord_id = $1
    `,
      [server_discord_id]
    );

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (!servers[0].approved_at) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned" };
    }

    const now = Date.now();

    await database.query<any>(
      `
        UPDATE servers
        SET approved_at = NULL, public = FALSE, language = NULL, category = NULL, tags = '{}', description = NULL, invite_link = NULL, nsfw = FALSE, updated_at = $1
        where
            discord_id = $2
    `,
      [now, server_discord_id]
    );

    setResponseStatus(event, 200);
    return { message: "Deleted" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
