import pool from "~/server/utils/database";
import type Server from "~/types/Server";

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
  const client = await pool.connect();
  try {
    const { rows: servers } = await client.query<Server>(
      `
      SELECT * FROM servers
      WHERE
        id = $1
    `,
      [server_id]
    );

    if (!servers.length) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Unauthorized" };
    }
    if (servers[0].banned) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Server is banned from Spectrex" };
    }
    if (!servers[0].approved_at) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "Server is not approved" };
    }

    const now = Date.now();

    await client.query(
      `
        UPDATE servers
        SET approved_at = NULL, public = FALSE, language = NULL, category = NULL, tags = '{}', description = NULL, invite_link = NULL, nsfw = FALSE, updated_at = $1
        WHERE
            id = $2
    `,
      [now.toString(), server_id]
    );

    client.release();

    return;
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
