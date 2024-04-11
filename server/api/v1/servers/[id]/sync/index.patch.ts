import pool from "~/server/utils/database";
import { cryptr } from "~/server/utils/auth";
import type Server from "~/types/Server";
import DiscordServerPartial from "~/types/DiscordServerPartial";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized", result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Sync server
  const client = await pool.connect();
  try {
    const response = await fetch(
      "https://discord.com/api/users/@me/guilds?with_counts=true",
      {
        headers: {
          Authorization: `Bearer ${cryptr.decrypt(
            event.context.session?.provider_access_token!
          )}`,
        },
      }
    );

    if (!response.ok) {
      client.release();

      setResponseStatus(event, 500);
      return {
        message: "An unknown Discord API error occurred, try again later",
      };
    }
    const servers_from_discord: DiscordServerPartial[] = await response.json();

    if (!servers_from_discord.length) {
      client.release();

      setResponseStatus(event, 404);
      return {
        message: "No servers found from Discord",
      };
    }

    const { rows: servers } = await client.query<Server>(
      `
            SELECT * FROM servers
            WHERE id = $1
          `,
      [server_id]
    );
    if (servers[0]) {
      if (servers[0].banned) {
        client.release();

        setResponseStatus(event, 403);
        return { message: "Server is banned from Spectrex", result: null };
      }

      for (const server_from_discord of servers_from_discord) {
        if (
          server_from_discord.owner &&
          server_from_discord.id === servers[0].provider_id
        ) {
          await client.query<any>(
            `
              UPDATE servers 
                SET updated_at = $1, owner_id = $2, owner_provider_id = $3, approximate_member_count = $4, approximate_presence_count = $5, name = $6, icon = $7
              WHERE
                  id = $8
            `,
            [
              Date.now().toString(),
              event.context.user.id,
              event.context.user.provider_id,
              server_from_discord.approximate_member_count.toString(),
              server_from_discord.approximate_presence_count.toString(),
              server_from_discord.name,
              server_from_discord.icon,
              servers[0].id,
            ]
          );

          client.release();

          return;
        }
      }
    }

    client.release();

    setResponseStatus(event, 403);
    return {
      message:
        "Server doesn't exist or you aren't the owner of it. Try syncing all servers first",
    };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
