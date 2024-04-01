import Cryptr from "cryptr";
import type { User } from "lucia";
import pool from "~/server/utils/database";
import DiscordUser from "~/types/DiscordUser";

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
  const client = await pool.connect();
  try {
    const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${cryptr.decrypt(
          event.context.session?.discord_access_token!
        )}`,
      },
    });

    if (!response.ok) {
      client.release();

      setResponseStatus(event, 500);
      return {
        message: "An unknown Discord API error occurred, try again later",
      };
    }
    const discord_user: DiscordUser = await response.json();

    if (!discord_user) {
      client.release();

      setResponseStatus(event, 404);
      return {
        message: "No user found from Discord",
      };
    }

    const { rows: users } = await client.query<User>(
      `
      SELECT * FROM users
      WHERE
        discord_id = $1 
      `,
      [event.context.user.discord_id]
    );

    if (!users.length) {
      client.release();

      setResponseStatus(event, 403);
      return {
        message: "User doesn't exist",
      };
    }

    await client.query(
      `
      UPDATE users
        SET discord_id = $1, username = $2, avatar = $3, global_name = $4, email = $5, updated_at = $6
      WHERE
          discord_id = $1
      `,
      [
        discord_user.id,
        discord_user.username,
        discord_user.avatar!,
        discord_user.global_name!,
        discord_user.email!,
        Date.now().toString(),
      ]
    );

    client.release();

    setResponseStatus(event, 200);
    return { message: "Synced user with Discord" };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
