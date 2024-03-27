import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { type Database } from "~/database.types";

export default defineEventHandler(async (event) => {
  // Parameters
  const query = getQuery(event);
  const page = query.page;
  const category = query.category;

  if (Number.isNaN(page)) {
    setResponseStatus(event, 500);
    return { message: "Invalid page query", result: null };
  }

  if (Number(page) < 0) {
    // minimum page
    setResponseStatus(event, 500);
    return { message: "Invalid page query (0-50)", result: null };
  }
  if (Number(page) > 50) {
    // max pages
    setResponseStatus(event, 500);
    return { message: "Exceeded page query (50 maximum)", result: null };
  }

  // 1. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "You are not logged in", result: null };
  }

  // 2. Fetch guilds and user
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

    const max_per_page = 10;

    let query = client
      .from("servers")
      .select("*")
      .not("approved_at", "is", null)
      .not("public", "is", false)
      .order("bumped_at")
      .limit(max_per_page) // max per page
      .range(
        max_per_page * Number(page),
        (Number(page) + 1) * max_per_page - 1
      );

    // Conditionally add the .eq() filter if category is not null
    console.log(category?.toString());
    if (category?.toString().length) {
      query = query.eq("category", category.toString());
    }

    const { data, error } = await query;

    if (error) {
      setResponseStatus(event, 500);
      return {
        message: "A database error occurred when fetching your feed",
        result: null,
      };
    }

    if (!data.length) {
      setResponseStatus(event, 500);
      return { message: "No servers found", result: null };
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
