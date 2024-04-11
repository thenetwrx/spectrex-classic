import { generateId } from "lucia";
import pool from "~/server/utils/database";
import { cryptr } from "~/server/utils/auth";
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
    const raw_guilds = await response.json();

    if (!raw_guilds.length) {
      client.release();

      setResponseStatus(event, 404);
      return {
        message: "No servers found from Discord",
      };
    }

    const { rows: servers } = await client.query<Server>(
      `
        SELECT * FROM servers
      `
    );

    for (let i = 0; i < raw_guilds.length; i++) {
      if (raw_guilds[i].owner) {
        const server = servers.find(
          (server) =>
            server.provider_id === raw_guilds[i].id && server.id === server_id
        );
        if (server) {
          if (server.banned) {
            client.release();

            setResponseStatus(event, 403);
            return { message: "Server is banned", result: null };
          }

          await client.query(
            `
            UPDATE servers 
              SET updated_at = $1, owner_id = $2, owner_provider_id = $3, approximate_member_count = $4, approximate_presence_count = $5, name = $6, icon = $7
            WHERE
                provider_id = $8
            `,
            [
              Date.now().toString(),
              event.context.user.id,
              event.context.user.provider_id,
              raw_guilds[i].approximate_member_count,
              raw_guilds[i].approximate_presence_count,
              raw_guilds[i].name,
              raw_guilds[i].icon,
              raw_guilds[i].id,
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
