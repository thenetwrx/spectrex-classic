import { eq } from "drizzle-orm";
import DiscordServerPartial from "~/types/DiscordServerPartial";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Require being logged in
  if (!event.context.user) {
    setResponseStatus(event, 401);
    return { message: generic_error_not_logged_in, result: null };
  }
  if (event.context.user.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned, result: null };
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
        message: generic_error_unknown_discord_error,
      };
    }
    const servers_from_discord: DiscordServerPartial[] = await response.json();

    if (!servers_from_discord.length) {
      setResponseStatus(event, 500);
      return generic_error_unknown_discord_error;
    }

    const servers = await database
      .select({
        id: servers_table.id,
        owner_id: servers_table.owner_id,
        banned: servers_table.banned,
        provider_id: servers_table.provider_id,
      })
      .from(servers_table)
      .where(eq(servers_table.id, server_id));

    if (servers[0]) {
      if (servers[0].banned) {
        setResponseStatus(event, 403);
        return { message: server_error_banned };
      }
      if (servers[0].owner_id !== event.context.user.id) {
        setResponseStatus(event, 403);
        return { message: server_error_no_permission };
      }

      for (const server_from_discord of servers_from_discord) {
        if (
          server_from_discord.owner &&
          server_from_discord.id === servers[0].provider_id
        ) {
          await database
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

          setResponseStatus(event, 204);
          return;
        }
      }

      await database
        .delete(servers_table)
        .where(eq(servers_table.id, servers[0].id));

      setResponseStatus(event, 204);
      return;
    }

    setResponseStatus(event, 404);
    return {
      message: server_error_does_not_exist,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: generic_error_unknown_error };
  }
});
