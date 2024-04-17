import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const user_id = params.id;

  // 1. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Fetch user
  try {
    const users = await db
      .select({
        id: users_table.id,
        provider_id: users_table.provider_id,
        username: users_table.username,
        avatar: users_table.avatar,
        display_name: users_table.display_name,
        premium_since: users_table.premium_since,
        description: users_table.description,
        public: users_table.public,
        banned: users_table.banned,
        admin: users_table.admin,
      })
      .from(users_table)
      .where(eq(users_table.id, user_id));

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: "User not found", result: null };
    }

    if (!users[0].public) {
      if (event.context.user?.id !== users[0].id) {
        setResponseStatus(event, 403);
        return { message: "Unauthorized", result: null };
      }
    }
    if (users[0].banned) {
      setResponseStatus(event, 403);
      return { message: "User is banned from Spectrex", result: null };
    }

    setResponseStatus(event, 200);
    return {
      message: null,
      result: users[0],
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
