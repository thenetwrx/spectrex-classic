import type Server from "~/types/Server";
import pool from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (!body.language?.length) {
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
  for (let i = 0; i > body.tags.length; i++) {
    if (body.tags[i].length > 16) {
      setResponseStatus(event, 400);
      return { message: `Tag #${i + 1} has too many characters (max of 16)` };
    }
  }
  if (!body.description?.length) {
    setResponseStatus(event, 400);
    return { message: "Description must not be empty" };
  }
  if (!body.invite_link?.length) {
    setResponseStatus(event, 400);
    return { message: "Invite link must not be empty" };
  }
  if (typeof body.nsfw !== "boolean") {
    setResponseStatus(event, 400);
    return { message: "An NSFW selection must be made" };
  }

  if (
    body.language === "unspecified" ||
    body.language === "en" ||
    body.language === "es" ||
    body.language === "it" ||
    body.language === "ja" ||
    body.language === "ru"
  ) {
  } else {
    setResponseStatus(event, 400);
    return { message: "Invalid language selection" };
  }

  if (
    body.category === "Community" ||
    body.category === "Music" ||
    body.category === "Gaming" ||
    body.category === "Anime" ||
    body.category === "Technology" ||
    body.category === "Movies" ||
    body.category === "Other"
  ) {
  } else {
    setResponseStatus(event, 400);
    return { message: "Invalid category selection" };
  }

  if (body.description.length <= 128) {
    setResponseStatus(event, 400);
    return {
      message: "Description does not have enough characters (minimum of 128)",
    };
  }

  if (body.description.length >= 512) {
    setResponseStatus(event, 400);
    return { message: "Description has too many characters (max of 512)" };
  }

  if (!body.invite_link.startsWith("https://discord.gg/")) {
    setResponseStatus(event, 400);
    return {
      message:
        "Invite link is not valid, must be https://discord.gg/<code here>",
    };
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
    const { rows: servers } = await client.query<Server>(
      `
      SELECT * FROM servers
      WHERE
        id = $1
    `,
      [server_id]
    );

    if (!servers.length) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Unauthorized" };
    }
    if (servers[0].banned) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Server is banned" };
    }
    if (servers[0].approved_at !== null) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Server is already approved" };
    }

    const now = Date.now();

    await client.query(
      `
        UPDATE servers
        SET approved_at = $1, bumped_at = $2, public = true, language = $3, category = $4, tags = $5, description = $6, invite_link = $7, nsfw = $8, updated_at = $1
        WHERE
            id = $9
    `,
      [
        now.toString(),
        servers[0].bumped_at === null ? now : servers[0].bumped_at,
        body.language,
        body.category,
        body.tags,
        body.description,
        body.invite_link,
        body.nsfw,
        server_id,
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
