import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { type Database } from "~/database.types";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Get local user
  const user = await serverSupabaseUser(event);

  // 2. Fetch guild
  try {
    const client = serverSupabaseServiceRole<Database>(event);

    if (user) {
      const { data: profile, error: profile_error } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id);

      if (profile_error) {
        setResponseStatus(event, 500);
        return {
          message: "A database error occurred when fetching your profile",
          result: null,
        };
      }

      if (!profile.length) {
        setResponseStatus(event, 500);
        return { message: "Your profile was not found", result: null };
      }
      if (profile[0].banned) {
        setResponseStatus(event, 500);
        return { message: "Your profile is banned", result: null };
      }
    }

    const { data, error } = await client
      .from("servers")
      .select("*")
      .eq("server_id", server_id);

    if (error) {
      setResponseStatus(event, 500);
      return {
        message: "A database error occurred when bumping the server",
        result: null,
      };
    }

    if (!data.length) {
      setResponseStatus(event, 500);
      return { message: "Server was not found", result: null };
    }

    if (
      !data[0].public &&
      user &&
      data[0].owner_provider_id !== user.user_metadata.provider_id
    ) {
      setResponseStatus(event, 500);
      return { message: "Server was not found", result: null };
    }
    if (
      data[0].banned &&
      user &&
      data[0].owner_provider_id !== user.user_metadata.provider_id
    ) {
      setResponseStatus(event, 500);
      return { message: "Server is banned", result: null };
    }
    if (
      data[0].approved_at === null &&
      user &&
      data[0].owner_provider_id !== user.user_metadata.provider_id
    ) {
      setResponseStatus(event, 500);
      return { message: "Server is not approved", result: null };
    }

    setResponseStatus(event, 200);

    return {
      message: null,
      result: data,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
