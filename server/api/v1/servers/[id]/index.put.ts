import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (!body?.language?.length) {
    setResponseStatus(event, 400);
    return { message: "Language must be selected" };
  }
  if (!body.category?.length) {
    setResponseStatus(event, 400);
    return { message: "Category must be selected" };
  }
  if (body.tags?.length > 5) {
    setResponseStatus(event, 400);
    return { message: "You already have too many tags (max of 5)" };
  }
  for (let i = 0; i < body.tags.length; i++) {
    if (contains_urls(body.tags[i])) {
      setResponseStatus(event, 400);
      return {
        message: `Tag #${i + 1} has a link, please review our guidelines`,
      };
    }
    if (contains_profanity(body.tags[i])) {
      setResponseStatus(event, 400);
      return {
        message: `Tag #${i + 1} has profanity, please review our guidelines`,
      };
    }
    if (body.tags[i].length > 16) {
      setResponseStatus(event, 400);
      return { message: `Tag #${i + 1} is too long (max of 16 characters)` };
    }
  }
  if (!body.description?.length) {
    setResponseStatus(event, 400);
    return { message: "Description must not be empty" };
  }
  if (typeof body.nsfw !== "boolean") {
    setResponseStatus(event, 400);
    return { message: "An NSFW selection must be made" };
  }

  if (!permitted_languages.some((code) => body.language === code)) {
    setResponseStatus(event, 400);
    return { message: "Invalid language selection" };
  }

  if (!permitted_categories.some((cat) => body.category === cat)) {
    setResponseStatus(event, 400);
    return { message: "Invalid category selection" };
  }

  if (contains_urls(body.description)) {
    setResponseStatus(event, 400);
    return {
      message: "Description contains a link, please review our guidelines",
    };
  }
  if (contains_profanity(body.description)) {
    setResponseStatus(event, 400);
    return {
      message: "Description contains profanity, please review our guidelines",
    };
  }
  if (body.description.length <= 128) {
    setResponseStatus(event, 400);
    return {
      message: "Description is too short (minimum of 128 characters)",
    };
  }
  if (body.description.length >= 512) {
    setResponseStatus(event, 400);
    return { message: "Description is too long (max of 512 characters)" };
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
        invite_link: servers_table.invite_link,
        bumped_at: servers_table.approved_at,
        rejected: servers_table.rejected,
        pending: servers_table.pending,
      })
      .from(servers_table)
      .where(eq(servers_table.owner_id, event.context.user.id));

    let count = 0;
    const max_count = event.context.user.premium_since !== null ? 5 : 1;
    for (const server of servers) {
      if (server.approved_at || server.pending || server.rejected) count++;
      if (count === max_count) {
        setResponseStatus(event, 403);
        return { message: "Maximum number of servers listed" };
      }
    }

    const server = servers.find((_server) => _server.id === server_id);

    if (!server) {
      setResponseStatus(event, 404);
      return { message: server_error_does_not_exist };
    }

    if (server.owner_id !== event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: server_error_no_permission };
    }
    if (server.banned) {
      setResponseStatus(event, 403);
      return { message: server_error_banned };
    }
    if (server.pending) {
      setResponseStatus(event, 403);
      return { message: server_error_already_pending };
    }
    if (server.approved_at !== null) {
      setResponseStatus(event, 403);
      return { message: server_error_already_approved };
    }
    if (server.invite_link === null) {
      setResponseStatus(event, 403);
      return { message: server_error_invite_link_not_configured };
    }

    const now = Date.now();

    await database
      .update(servers_table)
      .set({
        submitted_at: now,
        public: true,
        language: body.language,
        category: body.category,
        tags: body.tags,
        description: body.description,
        nsfw: body.nsfw,
        updated_at: now,
        pending: true,
      })
      .where(eq(servers_table.id, server.id));

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
    };
  }
});
