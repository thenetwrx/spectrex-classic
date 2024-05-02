import { eq } from "drizzle-orm";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (contains_urls(body.description)) {
    setResponseStatus(event, 400);
    return {
      message: "About me contains a link, please review our guidelines",
    };
  }
  if (contains_profanity(body.description)) {
    setResponseStatus(event, 400);
    return {
      message: "About me contains profanity, please review our guidelines",
    };
  }
  if (body.description?.length >= 128) {
    setResponseStatus(event, 400);
    return { message: "About me has too many characters (max of 128)" };
  }

  // 2. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex" };
  }

  // 3. Edit server
  try {
    const users = await db
      .select({ id: users_table.id, banned: users_table.banned })
      .from(users_table)
      .where(eq(users_table.id, event.context.user.id));

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
      return { message: "User is banned from Spectrex" };
    }

    await db
      .update(users_table)
      .set({
        description: body.description || null,
        updated_at: Date.now(),
      })
      .where(eq(users_table.id, users[0].id));

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
