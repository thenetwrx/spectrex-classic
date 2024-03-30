import { type Server } from "~/types/Server";

export default defineEventHandler(async (event) => {
  // 1. Check logged in status to prevent spam
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized", result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // 2. Fetch guilds
  try {
    const servers = await database<Server[]>`
      select 
        *
      from servers
      where
        owner_id = ${event.context.user.id}     
      `;

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "No servers found", result: null };
    }

    setResponseStatus(event, 200);
    return {
      message: null,
      result: servers,
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
