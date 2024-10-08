import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import db from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (!body?.issue_type.length) {
    setResponseStatus(event, 400);
    return { message: "Issue type must be selected" };
  }
  if (!body.description?.length) {
    setResponseStatus(event, 400);
    return { message: "Description must not be empty" };
  }

  if (!permitted_issue_types.some((type) => body.issue_type === type)) {
    setResponseStatus(event, 400);
    return { message: "Invalid issue type selection" };
  }

  if (body.description.length <= 16) {
    setResponseStatus(event, 400);
    return {
      message: "Description is too short (minimum of 16 characters)",
    };
  }

  if (body.description.length >= 128) {
    setResponseStatus(event, 400);
    return { message: "Description is too long (max of 128 characters)" };
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

  // 3. Create server report
  try {
    const servers = await db
      .select({
        id: servers_table.id,
        provider_id: servers_table.provider_id,
        owner_id: servers_table.owner_id,
        owner_provider_id: servers_table.owner_provider_id,
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
    if (servers[0].approved_at === null || servers[0].pending) {
      // refuse existence if it's not approved
      setResponseStatus(event, 404);
      return { message: server_error_does_not_exist };
    }
    if (servers[0].owner_id === event.context.user.id) {
      setResponseStatus(event, 403);
      return { message: "You can't report your own server" };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: server_error_banned };
    }

    await db.insert(server_reports_table).values({
      id: generateId(32),
      from_id: event.context.user.id,
      from_provider_id: event.context.user.provider_id,
      suspect_id: servers[0].owner_id,
      suspect_provider_id: servers[0].owner_provider_id,
      suspect_server_id: servers[0].id,
      suspect_server_provider_id: servers[0].provider_id,
      type: body.issue_type,
      description: body.description,
    });

    setResponseStatus(event, 200);
    return { message: "Report recorded" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
    };
  }
});
