// server/api/me/guilds.js
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { type Database } from "~/database.types";

// TODO: think about keeping bump cooldowns user specific instead of guild specific to prevent spam

export default defineEventHandler(async (event) => {
  // Parameters
  const params = getRouterParams(event);
  const server_id = params.id;

  // 1. Grab body
  const body = await readBody(event);
  console.log(body.language.length);

  // 2. Check variables on server side to prevent abuse
  if (typeof body.public !== "boolean") {
    setResponseStatus(event, 500);
    return { message: "A public selection must be made" };
  }
  if (!body.language?.length) {
    setResponseStatus(event, 500);
    return { message: "Language must be selected" };
  }
  if (body.tags?.length > 5) {
    setResponseStatus(event, 500);
    return { message: "You already have too many tags (max of 5)" };
  }
  for (let i = 0; i > body.tags.length; i++) {
    if (body.tags[i].length > 16) {
      setResponseStatus(event, 500);
      return { message: `Tag #${i + 1} has too many characters (max of 16)` };
    }
  }
  if (!body.description?.length) {
    setResponseStatus(event, 500);
    return { message: "Description must not be empty" };
  }
  if (!body.invite_link?.length) {
    setResponseStatus(event, 500);
    return { message: "Invite link must not be empty" };
  }
  if (typeof body.nsfw !== "boolean") {
    setResponseStatus(event, 500);
    return { message: "An NSFW selection must be made" };
  }

  if (
    body.language === "en" ||
    body.language === "es" ||
    body.language === "ru"
  ) {
  } else {
    setResponseStatus(event, 500);
    return { message: "Invalid language selection" };
  }

  if (body.description.length <= 128) {
    setResponseStatus(event, 500);
    return {
      message: "Description does not have enough characters (minimum of 128)",
    };
  }

  if (body.description.length >= 512) {
    setResponseStatus(event, 500);
    return { message: "Description has too many characters (max of 512)" };
  }

  if (!body.invite_link.startsWith("https://discord.gg/")) {
    setResponseStatus(event, 500);
    return {
      message:
        "Invite link is not valid, must be https://discord.gg/<code here>",
    };
  }

  // 3. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }

  // 4. Fetch guild and user and then update if applicable
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
      .select("owner_provider_id")
      .eq("server_id", server_id)
      .eq("owner_provider_id", user.user_metadata.provider_id);

    if (error) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when fetching the server" };
    }

    if (!data.length) {
      setResponseStatus(event, 500);
      return { message: "Server was not found" };
    }

    const { error: error1 } = await client
      .from("servers")
      .update({
        public: body.public,
        language: body.language,
        invite_link: body.invite_link,
        tags: body.tags,
        description: body.description,
        nsfw: body.nsfw,
      })
      .eq("server_id", server_id)
      .eq("owner_provider_id", user.user_metadata.provider_id)
      .select();

    if (error1) {
      setResponseStatus(event, 500);
      return { message: "A database error occurred when editing the server" };
    }

    setResponseStatus(event, 200);
    return { message: "Edited" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
