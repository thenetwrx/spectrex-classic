import { eq } from "drizzle-orm";

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
  if (body.description?.length >= 256) {
    setResponseStatus(event, 400);
    return { message: "About me is too long (max of 128 characters)" };
  }

  // 2. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: generic_error_not_logged_in };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned };
  }

  // 3. Edit server
  try {
    const users = await database
      .select({ id: users_table.id, banned: users_table.banned })
      .from(users_table)
      .where(eq(users_table.id, event.context.user.id));

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: user_error_does_not_exist };
    }

    if (users[0].id !== event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: user_error_no_permission };
    }
    if (users[0].banned) {
      setResponseStatus(event, 403);
      return { message: user_error_banned };
    }

    await database
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
      message: generic_error_unknown_error,
    };
  }
});
