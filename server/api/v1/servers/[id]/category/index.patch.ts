import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (!body.category?.length) {
    setResponseStatus(event, 400);
    return { message: "Category must be selected" };
  }
  if (!permitted_categories.some((cat) => body.category === cat)) {
    setResponseStatus(event, 400);
    return { message: "Invalid category selection" };
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
    const servers = await database
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
        banned: servers_table.banned,
        approved_at: servers_table.approved_at,
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
    if (servers[0].pending) {
      setResponseStatus(event, 403);
      return { message: server_error_pending_approval };
    }
    if (servers[0].approved_at === null) {
      setResponseStatus(event, 403);
      return { message: server_error_not_approved };
    }

    await database
      .update(servers_table)
      .set({
        public: body.public,
        language: body.language,
        category: body.category,
        tags: body.tags,
        description: body.description,
        invite_link: body.invite_link,
        nsfw: body.nsfw,
        updated_at: Date.now(),
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
