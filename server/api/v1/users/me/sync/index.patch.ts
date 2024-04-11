import type { User } from "lucia";
import { cryptr } from "~/server/utils/auth";
import pool from "~/server/utils/database";
import DiscordUser from "~/types/DiscordUser";

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

  // 2. Sync user
  const client = await pool.connect();
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${cryptr.decrypt(
          event.context.session?.provider_access_token!
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
    const provider_user: DiscordUser = await response.json();

    if (!provider_user) {
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
        id = $1
      `,
      [event.context.user.id]
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
      SET provider_id = $2, username = $3, avatar = $4, display_name = $5, email = $6, updated_at = $7
      WHERE
          id = $1
      `,
      [
        event.context.user.id,
        provider_user.id,
        provider_user.username,
        provider_user.avatar!,
        provider_user.global_name!,
        provider_user.email!,
        Date.now().toString(),
      ]
    );

    client.release();

    return;
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
