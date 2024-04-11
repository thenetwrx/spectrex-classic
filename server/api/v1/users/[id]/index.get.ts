import type { User } from "lucia";
import pool from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const user_id = params.id;

  // 1. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // 2. Fetch user
  const client = await pool.connect();
  try {
    const { rows: users } = await client.query<User>(
      `
      SELECT id, provider_id, username, avatar, display_name, premium_since, description, public, banned, admin FROM users
      WHERE
        id = $1
    `,
      [user_id]
    );

    client.release();

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: "User not found", result: null };
    }

    if (
      !users[0].public &&
      event.context.user &&
      users[0].id !== event.context.user.id
    ) {
      setResponseStatus(event, 404);
      return { message: "User was not found", result: null };
    }
    if (
      users[0].banned &&
      event.context.user &&
      users[0].id !== event.context.user.id
    ) {
      setResponseStatus(event, 403);
      return { message: "User is banned", result: null };
    }

    setResponseStatus(event, 200);
    return {
      message: null,
      result: users[0],
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
