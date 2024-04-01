import { generateId } from "lucia";
import pool from "~/server/utils/database";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_discord_id = params.id;

  // 1. Grab body
  const body = await readBody(event);

  // 2. Check variables on server side to prevent abuse
  if (typeof body.issue_type !== "number") {
    setResponseStatus(event, 500);
    return { message: "Issue type must be selected" };
  }
  if (!body.description?.length) {
    setResponseStatus(event, 500);
    return { message: "Description must not be empty" };
  }

  if (body.issue_type === 0 || body.issue_type === 1) {
  } else {
    setResponseStatus(event, 500);
    return { message: "Invalid issue type selection" };
  }

  if (body.description.length <= 16) {
    setResponseStatus(event, 500);
    return {
      message: "Description does not have enough characters (minimum of 16)",
    };
  }

  if (body.description.length >= 128) {
    setResponseStatus(event, 500);
    return { message: "Description has too many characters (max of 128)" };
  }

  // 3. Check logged in status to prevent spam
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned" };
  }

  // 4. Insert server report
  const client = await pool.connect();
  try {
    const { rows: servers } = await client.query<Server>(
      `
      SELECT * FROM servers
      WHERE
        discord_id = $1
    `,
      [server_discord_id]
    );

    if (!servers.length) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].approved_at === null) {
      client.release();

      // refuse existence if it's not approved
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].owner_id === event.context.user.id) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "You can't report your own server" };
    }
    if (servers[0].banned) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Server is banned" };
    }

    await client.query(
      `
      INSERT INTO server_reports
        (id, from_id, from_discord_id, suspect_id, suspect_discord_id, suspect_server_id, suspect_server_discord_id, type, description)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        generateId(15),
        event.context.user.id,
        event.context.user.discord_id,
        servers[0].owner_id,
        servers[0].owner_discord_id,
        servers[0].id,
        servers[0].discord_id,
        body.issue_type,
        body.description,
      ]
    );

    client.release();

    setResponseStatus(event, 200);
    return { message: "Report recorded" };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
