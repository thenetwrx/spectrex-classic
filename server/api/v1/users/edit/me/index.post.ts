import type { User } from "lucia";

export default defineEventHandler(async (event) => {
  // Parameters
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (typeof body.public !== "boolean") {
    setResponseStatus(event, 400);
    return { message: "A public selection must be made" };
  }
  if (body.description?.length >= 128) {
    setResponseStatus(event, 400);
    return { message: "Description has too many characters (max of 128)" };
  }

  // 2. Check logged in status to prevent spam
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned" };
  }

  // 3. Edit server
  try {
    const { rows: users } = await database.query<User>(
      `
      SELECT * FROM users
      WHERE
        discord_id = $1
    `,
      [event.context.user.discord_id]
    );

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: "User not found" };
    }

    if (users[0].id !== event.context.user.id) {
      setResponseStatus(event, 404);
      return { message: "User not found" };
    }
    if (users[0].banned) {
      setResponseStatus(event, 403);
      return { message: "User is banned" };
    }

    await database.query(
      `
        UPDATE users 
        SET public = $1, description = $2, updated_at = $3
        WHERE
            discord_id = $4
    `,
      [
        body.public,
        body.description || "",
        Date.now().toString(),
        event.context.user.discord_id,
      ]
    );

    setResponseStatus(event, 200);
    return {
      message: null,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
