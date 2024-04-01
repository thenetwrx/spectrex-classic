import pool from "~/server/utils/database";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_discord_id = params.id;
  const body = await readBody(event);

  // 1. Check variables on server side to prevent abuse
  if (typeof body.public !== "boolean") {
    setResponseStatus(event, 400);
    return { message: "A public selection must be made" };
  }
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

  // 2. Check logged in status to prevent spam
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
        discord_id = $1
    `,
      [server_discord_id]
    );

    if (!servers.length) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      client.release();

      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].banned) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Server is banned" };
    }
    if (servers[0].approved_at === null) {
      client.release();

      setResponseStatus(event, 403);
      return { message: "Server is not approved" };
    }

    await client.query(
      `
        UPDATE servers 
        SET public = $1, language = $2, category = $3, tags = $4, description = $5, invite_link = $6, nsfw = $7, updated_at = $8
        WHERE
            discord_id = $9
    `,
      [
        body.public,
        body.language,
        body.category,
        body.tags,
        body.description,
        body.invite_link,
        body.nsfw,
        Date.now().toString(),
        server_discord_id,
      ]
    );

    client.release();

    setResponseStatus(event, 200);
    return {
      message: null,
    };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
