// server/api/me/guilds.js
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { type Database } from "~/database.types";

export default defineEventHandler(async (event) => {
  // 1. Check logged in status to prevent spam
  const user = await serverSupabaseUser(event);
  console.log(user);
  if (!user) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }

  // 2. Get access token from Supabase session
  const provider_token = getCookie(event, "sb-provider-token");
  if (!provider_token) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized" };
  }

  // 3. Fetch guilds using raw HTTP
  try {
    const response = await fetch(
      "https://discord.com/api/users/@me/guilds?with_counts=true",
      {
        headers: {
          Authorization: `Bearer ${provider_token}`,
        },
      }
    );

    if (!response.ok) {
      setResponseStatus(event, 500);
      return {
        message: "An unknown Discord API error occurred, try again later",
      };
    }

    const raw_guilds = await response.json();
    const client = await serverSupabaseClient<Database>(event);

    if (!raw_guilds.length) {
      setResponseStatus(event, 500);
      return { message: "You are not in any servers" };
    }

    for (let i = 0; i < raw_guilds.length; i++) {
      if (raw_guilds[i].owner) {
        const { data, error } = await client
          .from("servers")
          .select("*")
          .eq("server_id", raw_guilds[i].id);

        if (error) {
          setResponseStatus(event, 500);
          return {
            message: "A database error occurred when fetching the server",
          };
        }

        if (data?.length) {
          const { error: error1 } = await client
            .from("servers")
            .update({
              server_id: raw_guilds[i].id,
              approximate_member_count: raw_guilds[i].approximate_member_count,
              approximate_presence_count:
                raw_guilds[i].approximate_presence_count,
              owner_provider_id: user.user_metadata.provider_id,
              server_name: raw_guilds[i].name,
              icon: raw_guilds[i].icon,
            })
            .eq("server_id", raw_guilds[i].id)
            .select();

          if (error1) {
            setResponseStatus(event, 500);
            return {
              message: "A database error occurred when fetching a server",
            };
          }
        } else {
          const { error: error1 } = await client.from("servers").insert({
            server_id: raw_guilds[i].id,
            approximate_member_count: raw_guilds[i].approximate_member_count,
            approximate_presence_count:
              raw_guilds[i].approximate_presence_count,
            created_at: Date.now(),
            bumped_at: Date.now(),
            owner_provider_id: user.user_metadata.provider_id,
            owner_id: user.id,
            server_name: raw_guilds[i].name,
            icon: raw_guilds[i].icon,
          });

          if (error1) {
            setResponseStatus(event, 500);
            return {
              message: "A database error occurred when fetching a server",
            };
          }
        }
      }
    }

    setResponseStatus(event, 200);
    return { message: "Synced available servers with Discord" };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return { message: "An unknown error occurred, try again later" };
  }
});
