import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { type Database } from "~/database.types";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const user_id = params.id;

  // 1. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "You are not logged in" };
  }

  // 2. Get access token from Supabase session
  const provider_token = getCookie(event, "sb-provider-token");
  if (!provider_token) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }

  // 3. Fetch guilds using raw HTTP
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${provider_token}`,
      },
    });

    if (!response.ok) {
      setResponseStatus(event, 500);
      return {
        message: "An unknown Discord API error occurred, try again later",
      };
    }

    const discord_user = await response.json();
    const client = await serverSupabaseServiceRole<Database>(event);

    if (!discord_user.id?.length) {
      setResponseStatus(event, 500);
      return { message: "Discord user doesn't exist" };
    }

    const { data: profile, error: profile_error } = await client
      .from("profiles")
      .select("*")
      .eq("provider_id", user_id);

    if (profile_error) {
      setResponseStatus(event, 500);
      return {
        message: "A database error occurred when fetching your profile",
      };
    }

    if (!profile.length) {
      setResponseStatus(event, 500);
      return { message: "Your profile was not found" };
    }
    if (profile[0].banned) {
      setResponseStatus(event, 500);
      return { message: "Your profile is banned" };
    }

    const { error: error1 } = await client
      .from("profiles")
      .update({
        full_name: discord_user.username,
        global_name: discord_user.global_name,
        avatar_url:
          "https://cdn.discordapp.com/avatars/" +
          discord_user.id +
          "/" +
          discord_user.avatar +
          ".png",
        updated_at: Date.now(),
      })
      .eq("provider_id", user_id)
      .select();

    if (error1) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when editing the profile" };
    }

    setResponseStatus(event, 200);
    return { message: "Profile synced with Discord" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
