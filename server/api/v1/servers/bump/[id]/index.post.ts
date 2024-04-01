import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_discord_id = params.id;

  // 1. Check logged in status to prevent spam
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned" };
  }

  // 2. Edit server
  try {
    const { rows: servers } = await database.query<Server>(
      `
      SELECT * FROM servers
      WHERE
        discord_id = $1
    `,
      [server_discord_id]
    );

    if (!servers.length) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }

    if (servers[0].owner_id !== event.context.user.id) {
      setResponseStatus(event, 404);
      return { message: "Server not found" };
    }
    if (servers[0].banned) {
      setResponseStatus(event, 403);
      return { message: "Server is banned" };
    }
    if (servers[0].approved_at === null) {
      setResponseStatus(event, 403);
      return { message: "Server is not approved" };
    }

    // Compare the timestamps
    const now = Date.now();
    const cooldown =
      event.context.user.premium_since !== null ? 3600000 : 7200000;
    if (Number(servers[0].bumped_at || 0) + cooldown <= now) {
      await database.query(
        `
        UPDATE servers
        SET bumped_at = $1, updated_at = $1
        WHERE
            discord_id = $2
    `,
        [now.toString(), server_discord_id]
      );

      setResponseStatus(event, 200);
      return { message: "Bumped" };
    }

    const timeLeftMilliseconds =
      now - Number(servers[0].bumped_at || 0) - cooldown;
    const timeLeftMessage = `Bump is on cooldown`;

    setResponseStatus(event, 403);

    return {
      message: timeLeftMessage,
      timeLeft: timeLeftMilliseconds,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
