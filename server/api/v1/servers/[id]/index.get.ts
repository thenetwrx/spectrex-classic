import pool from "~/server/utils/database";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Sync guild
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

    client.release();

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
      setResponseStatus(event, 403);
      return { message: "Server is not approved", result: null };
    }

    setResponseStatus(event, 200);
    return {
      message: null,
      result: servers[0],
    };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
