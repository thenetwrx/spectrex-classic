import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { type Database } from "~/database.types";

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Grab body
  const body = await readBody(event);

  // 2. Check variables on server side to prevent abuse
  if (typeof body.issue_type !== "number") {
    setResponseStatus(event, 500);
    return { message: "Issue type must be selected" };
  }
  if (!body.description?.length) {
    setResponseStatus(event, 500);
    return { message: "Description must not be empty" };
  }

  if (body.issue_type === 0 || body.issue_type === 1) {
  } else {
    setResponseStatus(event, 500);
    return { message: "Invalid issue type selection" };
  }

  if (body.description.length <= 16) {
    setResponseStatus(event, 500);
    return {
      message: "Description does not have enough characters (minimum of 16)",
    };
  }

  if (body.description.length >= 128) {
    setResponseStatus(event, 500);
    return { message: "Description has too many characters (max of 128)" };
  }

  // 3. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }

  // 4. Fetch guild and user and then update if applicable
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

    if (data[0].owner_provider_id === user.user_metadata.provider_id) {
      setResponseStatus(event, 500);
      return { message: "You can not report your own server" };
    }
    if (data[0].banned) {
      setResponseStatus(event, 500);
      return { message: "Server is already banned" };
    }
    if (!data[0].public) {
      setResponseStatus(event, 500);
      return { message: "Server was not found" };
    }

    const { error: error1 } = await client.from("server_reports").insert({
      type: body.issue_type,
      from_id: user.id,
      from_provider_id: user.user_metadata.provider_id,
      server_id: server_id,
      description: body.description,
      server_owner_id: data[0].owner_id,
      server_owner_provider_id: data[0].owner_provider_id,
    });

    if (error1) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when reporting the server" };
    }

    setResponseStatus(event, 200);
    return { message: "Report recorded" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
