import { generateId } from "lucia";
import { cryptr } from "~/server/utils/auth";
import pool from "~/server/utils/database";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Check logged in status to prevent spam
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized", result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // 2. Fetch guilds using raw HTTP
  const client = await pool.connect();
  try {
    const response = await fetch(
      "https://discord.com/api/users/@me/guilds?with_counts=true",
      {
        headers: {
          Authorization: `Bearer ${cryptr.decrypt(
            event.context.session?.discord_access_token!
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
    const raw_guilds = await response.json();

    if (!raw_guilds.length) {
      client.release();

      setResponseStatus(event, 404);
      return {
        message: "No servers found from Discord",
      };
    }

    const { rows: servers } = await client.query<Server>(
      `SELECT * FROM servers`
    );
    for (let i = 0; i < raw_guilds.length; i++) {
      const db_index = servers.findIndex(
        (element) => element.discord_id === raw_guilds[i].id
      );
      if (
        raw_guilds[i].owner &&
        raw_guilds[i].id === servers[db_index].discord_id
      ) {
        if (servers[db_index].banned) {
          client.release();

          setResponseStatus(event, 403);
          return { message: "Server is banned", result: null };
        }

        await client.query(
          `
            UPDATE servers 
              SET updated_at = $1, approximate_member_count = $2, approximate_presence_count = $3, name = $4, icon = $5
            WHERE
                id = $6
            `,
          [
            Date.now().toString(),
            raw_guilds[i].approximate_member_count,
            raw_guilds[i].approximate_presence_count,
            raw_guilds[i].name,
            raw_guilds[i].icon,
            servers[db_index].id,
          ]
        );
      } else {
        const now = Date.now();

        await client.query(
          `
          INSERT INTO servers
            (id, discord_id, approximate_member_count, approximate_presence_count, created_at, updated_at, owner_discord_id, owner_id, name, icon)
          VALUES
            ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)
        `,
          [
            generateId(32),
            raw_guilds[i].id,
            raw_guilds[i].approximate_member_count,
            raw_guilds[i].approximate_presence_count,
            now.toString(),
            event.context.user.discord_id,
            event.context.user.id,
            raw_guilds[i].name,
            raw_guilds[i].icon,
          ]
        );
      }

      client.release();

      return;
    }

    client.release();

    setResponseStatus(event, 403);
    return { message: "You must own that server" };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
