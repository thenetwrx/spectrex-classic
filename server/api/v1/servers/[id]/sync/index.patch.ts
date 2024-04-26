import { eq } from "drizzle-orm";
import db from "~/server/utils/database";
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

  // 2. Sync server with Discord
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
      setResponseStatus(event, 404);
      return {
        message: "No servers found from Discord",
      };
    }

    const servers = await db
      .select({
        id: servers_table.id,
        banned: servers_table.banned,
        provider_id: servers_table.provider_id,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (servers[0]) {
      if (servers[0].banned) {
        setResponseStatus(event, 403);
        return { message: "Server is banned from Spectrex", result: null };
      }

      for (const server_from_discord of servers_from_discord) {
        if (
          server_from_discord.owner &&
          server_from_discord.id === servers[0].provider_id
        ) {
          await db
            .update(servers_table)
            .set({
              updated_at: Date.now(),
              owner_id: event.context.user.id,
              owner_provider_id: event.context.user.provider_id,
              approximate_member_count:
                server_from_discord.approximate_member_count,
              approximate_presence_count:
                server_from_discord.approximate_presence_count,
              name: server_from_discord.name,
              icon: server_from_discord.icon,
            })
            .where(eq(servers_table.id, servers[0].id));
          return;
        }
      }

      await db.delete(servers_table).where(eq(servers_table.id, servers[0].id));
      return;
    }

    setResponseStatus(event, 404);
    return {
      message: "Server doesn't exist. Try syncing all servers first",
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
