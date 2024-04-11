import type { User } from "lucia";
import pool from "~/server/utils/database";

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

  // 2. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned" };
  }

  // 3. Edit server
  const client = await pool.connect();
  try {
    const { rows: users } = await client.query<User>(
      `
      SELECT * FROM users
      WHERE
        id = $1
    `,
      [event.context.user.id]
    );

    if (!users.length) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "User not found" };
    }

    if (users[0].id !== event.context.user.id) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "User not found" };
    }
    if (users[0].banned) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "User is banned" };
    }

    await client.query(
      `
        UPDATE users 
        SET public = $2, description = $3, updated_at = $4
        WHERE
            id = $1
    `,
      [
        event.context.user.id,
        body.public,
        body.description || "",
        Date.now().toString(),
      ]
    );

    client.release();

    return;
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
