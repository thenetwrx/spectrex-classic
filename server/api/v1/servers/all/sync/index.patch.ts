import { and, eq, inArray, notInArray } from "drizzle-orm";
import { generateId } from "lucia";
import { cryptr } from "~/server/utils/auth";
import db from "~/server/utils/database";
import DiscordServerPartial from "~/types/DiscordServerPartial";

export default defineEventHandler(async (event) => {
  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: "You must be logged in to do that", result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 2. Sync all servers
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

    // 3. Sync servers with Discord
    const servers = await db
      .select({
        id: servers_table.id,
        provider_id: servers_table.provider_id,
        banned: servers_table.banned,
      })
      .from(servers_table)
      .where(
        inArray(
          servers_table.provider_id,
          servers_from_discord.map((server) => server.id)
        )
      );

    for (const server_from_discord of servers_from_discord) {
      if (server_from_discord.owner) {
        const server = servers.find(
          (server) => server.provider_id === server_from_discord.id
        );
        if (server) {
          if (server.banned) continue;

          const now = Date.now();

          await db
            .update(servers_table)
            .set({
              updated_at: now,
              owner_id: event.context.user.id,
              owner_provider_id: event.context.user.provider_id,
              approximate_member_count:
                server_from_discord.approximate_member_count,
              approximate_presence_count:
                server_from_discord.approximate_presence_count,
              name: server_from_discord.name,
              icon: server_from_discord.icon,
            })
            .where(eq(servers_table.id, server.id));
        } else {
          const now = Date.now();

          await db.insert(servers_table).values({
            id: generateId(32),
            provider_id: server_from_discord.id,
            approximate_member_count:
              server_from_discord.approximate_member_count,
            approximate_presence_count:
              server_from_discord.approximate_presence_count,
            created_at: now,
            updated_at: now,
            owner_id: event.context.user.id,
            owner_provider_id: event.context.user.provider_id,
            name: server_from_discord.name,
            icon: server_from_discord.icon,
          });
        }
      }
    }

    // 4. Delete servers not found in servers_from_discord
    await db.delete(servers_table).where(
      and(
        eq(servers_table.owner_id, event.context.user.id), // Servers owned by the user
        notInArray(
          servers_table.provider_id,
          servers_from_discord.map((server) => server.id)
        ) // Servers not found in servers_from_discord
      )
    );

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
