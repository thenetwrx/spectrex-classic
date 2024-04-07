import { generateState } from "arctic";
import { discord } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const redirect_uri = query.redirect_to?.toString() ?? null;

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
