import { generateId } from "lucia";
import { type Server } from "~/types/Server";

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
  try {
    const servers = await database<Server[]>`
      select 
        *
      from servers
      where
        discord_id = ${server_discord_id}
    `;

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].approved_at === null) {
      // refuse existence if it's not approved
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].owner_id === event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: "You can't report your own server" };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned" };
    }

    await database`insert into server_reports
            (id, from_id, type, discord_id, server_discord_id, server_owner_discord_id, server_owner_id, description, from_discord_id)
        values
            (${generateId(15)}, ${event.context.user.id}, ${body.issue_type}, ${
      servers[0].discord_id
    }, ${servers[0].owner_discord_id}, ${servers[0].owner_id}, ${
      body.description
    }, ${event.context.user.discord_id})
        `;

    setResponseStatus(event, 200);
    return { message: "Report recorded" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
