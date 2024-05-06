import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // 1. Reject non-admins
  if (!event.context.user?.admin) {
    setResponseStatus(event, 403);
    return { message: "You must be an admin in to do this", result: null };
  }

  // 2. Fetch users
  try {
    const servers = await db.select().from(servers_table);

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "0 servers were found", result: null };
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
