import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: generic_error_not_logged_in };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned };
  }

  // 2. Edit server
  try {
    const servers = await database
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
        banned: servers_table.banned,
        approved_at: servers_table.approved_at,
        rejected: servers_table.rejected,
        pending: servers_table.pending,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: server_error_does_not_exist };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: server_error_no_permission };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: server_error_banned };
    }
    // refuse deletion if its not approved, pending or rejected
    if (
      !servers[0].approved_at &&
      !servers[0].rejected &&
      !servers[0].pending
    ) {
      setResponseStatus(event, 403);
      return { message: server_error_not_listed };
    }

    await database
      .update(servers_table)
      .set({
        approved_at: null,
        public: false,
        language: null,
        category: null,
        tags: [],
        description: null,
        invite_link: null,
        nsfw: false,
        updated_at: Date.now(),
        pending: false,
        submitted_at: null,
        rejected: false,
      })
      .where(eq(servers_table.id, servers[0].id));

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
    };
  }
});
