import { type Server } from "~/types/Server";

export default defineEventHandler(async (event) => {
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // Parameters
  const params = getRouterParams(event);
  const server_discord_id = params.id;

  // 2. Sync guild
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
      return { message: "Server not found", result: null };
    }

    if (
      !servers[0].public &&
      event.context.user &&
      servers[0].owner_discord_id !== event.context.user.discord_id
    ) {
      setResponseStatus(event, 404);
      return { message: "Server was not found", result: null };
    }
    if (
      servers[0].banned &&
      event.context.user &&
      servers[0].owner_discord_id !== event.context.user.discord_id
    ) {
      setResponseStatus(event, 403);
      return { message: "Server is banned", result: null };
    }
    if (
      servers[0].approved_at === null &&
      event.context.user &&
      servers[0].owner_discord_id !== event.context.user.discord_id
    ) {
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

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
