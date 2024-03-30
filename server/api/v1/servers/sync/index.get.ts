import Cryptr from "cryptr";
import { generateId } from "lucia";
import { Server } from "~/types/Server";

export default defineEventHandler(async (event) => {
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
  try {
    const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

    const response = await fetch(
      "https://discord.com/api/users/@me/guilds?with_counts=true",
      {
        headers: {
          Authorization: `Bearer ${cryptr.decrypt(
            event.context.session?.discord_access_token || ""
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
    const raw_guilds = await response.json();

    if (!raw_guilds.length) {
      setResponseStatus(event, 403);
      return { message: "No servers found from Discord" };
    }

    for (let i = 0; i < raw_guilds.length; i++) {
      if (raw_guilds[i].owner) {
        const servers = await database<Server[]>`
            select 
                *
            from servers
            where
                discord_id = ${raw_guilds[i].id} 
        `;

        const server = servers.find(
          (server) => server.discord_id === raw_guilds[i].id
        );
        if (server) {
          if (server.banned) continue;

          await database`
            update servers set updated_at = ${Date.now()}, approximate_member_count = ${
            raw_guilds[i].approximate_member_count
          }, approximate_presence_count = ${
            raw_guilds[i].approximate_presence_count
          }, name = ${raw_guilds[i].name}, icon = ${raw_guilds[i].icon}
            where
                discord_id = ${raw_guilds[i].id} 
            `;
        } else {
          await database`insert into servers
            (id, discord_id, approximate_member_count, approximate_presence_count, created_at, bumped_at, updated_at, owner_discord_id, owner_id, name, icon)
        values
            (${generateId(15)}, ${raw_guilds[i].id}, ${
            raw_guilds[i].approximate_member_count
          }, ${
            raw_guilds[i].approximate_presence_count
          }, ${Date.now()}, ${Date.now()}, ${Date.now()}, ${
            event.context.user.discord_id
          }, ${event.context.user.id}, ${raw_guilds[i].name}, ${
            raw_guilds[i].icon
          })
        `;
        }
      }
    }

    setResponseStatus(event, 200);
    return { message: "Synced available servers with Discord" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
