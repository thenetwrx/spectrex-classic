import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (typeof body?.monthly_server_reports !== "boolean") {
    setResponseStatus(event, 400);
    return { message: "A selection for monthly server reports must be made" };
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

    // in reality these should never be executed, but fuck it
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
        monthly_server_reports: body.monthly_server_reports,
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
