import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { type Database } from "~/database.types";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }

  // 2. Fetch guild and user and then update if applicable
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
      return { message: "A database error occurred when fetching the server" };
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

    const { error: error1 } = await client
      .from("servers")
      .update({
        approved_at: null,
        public: false,
        language: null,
        category: null,
        tags: [],
        description: null,
        invite_link: null,
        nsfw: false,
        updated_at: Date.now(),
      })
      .eq("server_id", server_id)
      .eq("owner_provider_id", user.user_metadata.provider_id)
      .select();

    if (error1) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when deleting the server" };
    }

    setResponseStatus(event, 200);
    return { message: "Deleted" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
