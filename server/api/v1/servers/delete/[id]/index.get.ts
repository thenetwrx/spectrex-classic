// server/api/me/guilds.js
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { type Database } from "~/database.types";

// TODO: think about keeping bump cooldowns user specific instead of guild specific to prevent spam

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 403);
    return { message: "You are not logged in" };
  }

  // 2. Fetch guild and user and then update
  try {
    const client = await serverSupabaseClient<Database>(event);

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

    const { data, error } = await client
      .from("servers")
      .select("bumped_at,owner_provider_id")
      .eq("server_id", server_id)
      .eq("owner_provider_id", user.user_metadata.provider_id);

    if (error) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when fetching the server" };
    }

    if (!data.length) {
      setResponseStatus(event, 500);
      return { message: "Your server was not found" };
    }

    const { error: error1 } = await client
      .from("servers")
      .update({
        approved_at: null,
      })
      .eq("server_id", server_id)
      .eq("owner_provider_id", user.user_metadata.provider_id)
      .select();

    if (error1) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when deleting the server" };
    }

    setResponseStatus(event, 200);
    return { message: "Server deleted" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
