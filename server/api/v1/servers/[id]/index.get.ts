import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned, result: null };
  }

  // 2. Fetch guild
  try {
    const servers = await database
      .select()
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: server_error_does_not_exist, result: null };
    }

    if (!servers[0].public) {
      if (event.context.user?.id !== servers[0].owner_id) {
        setResponseStatus(event, 403);
        return {
          message: server_error_no_permission,
          result: null,
        };
      }
    }
    if (servers[0].banned && event.context.user?.id !== servers[0].owner_id) {
      setResponseStatus(event, 403);
      return { message: server_error_banned, result: null };
    }
    if (servers[0].pending) {
      if (event.context.user?.id !== servers[0].owner_id) {
        setResponseStatus(event, 403);
        return { message: server_error_pending_approval };
      }
    }
    if (servers[0].approved_at === null) {
      if (event.context.user?.id !== servers[0].owner_id) {
        setResponseStatus(event, 403);
        return { message: server_error_not_approved, result: null };
      }
    }

    setResponseStatus(event, 200);

    if (servers[0].owner_id !== event.context.user?.id)
      servers[0].invite_link = null;

    if (
      event.context.user?.premium_since === null ||
      servers[0].owner_id !== event.context.user?.id
    )
      servers[0].invite_uses = null;

    return {
      message: null,
      result: servers[0],
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
      result: null,
    };
  }
});
