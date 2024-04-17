import { eq } from "drizzle-orm";
import db from "~/server/utils/database";
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
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${cryptr.decrypt(
          event.context.session?.provider_access_token!
        )}`,
      },
    });

    if (!response.ok) {
      setResponseStatus(event, 500);
      return {
        message: "An unknown Discord API error occurred, try again later",
      };
    }
    const provider_user: DiscordUser = await response.json();

    if (!provider_user) {
      setResponseStatus(event, 404);
      return {
        message: "No user found from Discord",
      };
    }

    const users = await db
      .select({ id: users_table.id })
      .from(users_table)
      .where(eq(users_table.id, event.context.user.id));

    if (!users.length) {
      setResponseStatus(event, 404);
      return { message: "User not found" };
    }

    await db
      .update(users_table)
      .set({
        provider_id: provider_user.id,
        username: provider_user.username,
        avatar: provider_user.avatar,
        display_name: provider_user.global_name,
        email: provider_user.email!,
        updated_at: Date.now().toString(),
      })
      .where(eq(users_table.id, users[0].id));

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
