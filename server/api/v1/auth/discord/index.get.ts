import { generateState, Discord } from "arctic";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const redirect_uri = query.redirect_to?.toString() ?? null;

  const discord = new Discord(
    process.env.DISCORD_CLIENT_ID!,
    process.env.DISCORD_CLIENT_SECRET!,
    process.env.BASE_URL! + "/api/v1/auth/discord/callback"
  );

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

  if (redirect_uri)
    setCookie(event, "redirect_to", redirect_uri, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
  return sendRedirect(event, url.toString());
});
