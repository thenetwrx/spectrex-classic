import type { User } from "lucia";

export default defineEventHandler(async (event) => {
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // Parameters
  const params = getRouterParams(event);
  const user_discord_id = params.id;

  // 3. Fetch user
  try {
    const { rows: users } = await database.query<User>(
      `
      SELECT * FROM users
      WHERE
        discord_id = $1
    `,
      [user_discord_id]
    );

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: "User not found", result: null };
    }

    if (
      !users[0].public &&
      event.context.user &&
      users[0].discord_id !== event.context.user.discord_id
    ) {
      setResponseStatus(event, 404);
      return { message: "User was not found", result: null };
    }
    if (
      users[0].banned &&
      event.context.user &&
      users[0].discord_id !== event.context.user.discord_id
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

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
