import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { type Database } from "~/database.types";

// TODO: think about keeping bump cooldowns user specific instead of guild specific to prevent spam

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "You are not logged in" };
  }

  // 2. Fetch guild and user and then update if applicable
  try {
    const client = await serverSupabaseServiceRole<Database>(event);

    const { data: profile, error: profile_error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id);

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

    const { data, error } = await client
      .from("servers")
      .select("*")
      .eq("server_id", server_id);

    if (error) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when bumping the server" };
    }

    if (!data.length) {
      setResponseStatus(event, 500);
      return { message: "Server was not found" };
    }

    if (data[0].owner_provider_id !== user.user_metadata.provider_id) {
      setResponseStatus(event, 500);
      return { message: "Server was not found" };
    }
    if (data[0].banned) {
      setResponseStatus(event, 500);
      return { message: "Server is banned" };
    }
    if (data[0].approved_at === null) {
      setResponseStatus(event, 500);
      return { message: "Server is not approved" };
    }

    // Compare the timestamps
    const now = Date.now();
    const cooldown = profile[0].premium_since !== null ? 3600000 : 7200000;
    if ((data[0].bumped_at || 0) + cooldown <= now) {
      const { error } = await client
        .from("servers")
        .update({ bumped_at: now, updated_at: Date.now() })
        .eq("server_id", server_id)
        .select();

      if (error) {
        setResponseStatus(event, 500);
        return { message: "A database error occurred when bumping the server" };
      } else {
        setResponseStatus(event, 200);
        return { message: "Bumped" };
      }
    }

    const timeLeftMilliseconds = now - (data[0].bumped_at || 0) - cooldown;
    const timeLeftMessage = `Bump is on cooldown`;

    setResponseStatus(event, 403);

    return {
      message: timeLeftMessage,
      timeLeft: timeLeftMilliseconds,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
