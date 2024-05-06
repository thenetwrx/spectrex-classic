import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // 1. Reject non-admins
  if (!event.context.user?.admin) {
    setResponseStatus(event, 403);
    return { message: "You must be an admin to do this", result: null };
  }

  // 2. Fetch users
  try {
    const users = await db.select().from(users_table);

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: "No users found", result: null };
    }

    setResponseStatus(event, 200);
    return {
      message: null,
      result: users,
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
