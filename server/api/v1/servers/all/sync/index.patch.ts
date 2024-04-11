import { generateId } from "lucia";
import { cryptr } from "~/server/utils/auth";
import pool from "~/server/utils/database";
import DiscordServerPartial from "~/types/DiscordServerPartial";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized", result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Sync all servers
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
      setResponseStatus(event, 500);
      return {
        message: "An unknown Discord API error occurred, try again later",
      };
    }
    const servers_from_discord: DiscordServerPartial[] = await response.json();

    if (!servers_from_discord.length) {
      setResponseStatus(event, 403);
      return { message: "No servers found from Discord" };
    }

    // 3. Batch database operations
    const now = Date.now();
    const queries = [];
    for (const server_from_discord of servers_from_discord) {
      if (server_from_discord.owner) {
        const { rows: servers } = await client.query<Server>(
          `
            SELECT * FROM servers
            WHERE provider_id = $1
          `,
          [server_from_discord.id]
        );
        if (servers[0]) {
          if (servers[0].banned) continue;

          queries.push(
            client.query<any>(
              `
                UPDATE servers 
                  SET updated_at = $1, owner_id = $2, owner_provider_id = $3, approximate_member_count = $4, approximate_presence_count = $5, name = $6, icon = $7
                WHERE
                    id = $8
                `,
              [
                now.toString(),
                event.context.user.id,
                event.context.user.provider_id,
                server_from_discord.approximate_member_count.toString(),
                server_from_discord.approximate_presence_count.toString(),
                server_from_discord.name,
                server_from_discord.icon,
                servers[0].id,
              ]
            )
          );
        } else {
          queries.push(
            client.query<any>(
              `
                INSERT INTO servers
                  (id, provider_id, approximate_member_count, approximate_presence_count, created_at, updated_at, owner_id, owner_provider_id, name, icon)
                VALUES
                  ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)
              `,
              [
                generateId(32),
                server_from_discord.id,
                server_from_discord.approximate_member_count.toString(),
                server_from_discord.approximate_presence_count.toString(),
                now.toString(),
                event.context.user.id,
                event.context.user.provider_id,
                server_from_discord.name,
                server_from_discord.icon,
              ]
            )
          );
        }
      }
    }
    await Promise.all(queries);

    client.release();

    return;
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
