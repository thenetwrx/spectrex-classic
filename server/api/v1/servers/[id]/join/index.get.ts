import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned };
  }

  // 2. Edit server
  try {
    const servers = await database
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
        public: servers_table.public,
        banned: servers_table.banned,
        approved_at: servers_table.approved_at,
        invite_link: servers_table.invite_link,
        invite_uses: servers_table.invite_uses,
        pending: servers_table.pending,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: server_error_does_not_exist };
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
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: server_error_banned, result: null };
    }
    if (servers[0].pending) {
      setResponseStatus(event, 403);
      return { message: server_error_pending_approval };
    }
    if (servers[0].approved_at === null) {
      if (event.context.user?.id !== servers[0].owner_id) {
        setResponseStatus(event, 403);
        return { message: server_error_not_approved, result: null };
      }
    }

    // use ? because we make invite_uses possibly null on client side, but database enforces not null
    servers[0].invite_uses?.push(Date.now().toString());
    await database
      .update(servers_table)
      .set({
        invite_uses: servers[0].invite_uses,
      })
      .where(eq(servers_table.id, servers[0].id));

    return sendRedirect(event, servers[0].invite_link || "/");
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
    };
  }
});
