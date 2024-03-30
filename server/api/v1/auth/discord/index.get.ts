import { generateState, Discord } from "arctic";

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  process.env.BASE_URL! + "/api/v1/auth/discord/callback"
);

export default defineEventHandler(async (event) => {
  const state = generateState();
  const url = await discord.createAuthorizationURL(state, {
    scopes: ["identify", "email", "guilds"],
  });

  setCookie(event, "discord_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  return sendRedirect(event, url.toString());
});
