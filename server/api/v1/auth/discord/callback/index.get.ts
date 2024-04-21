import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import db from "~/server/utils/database";
import DiscordUser from "~/types/DiscordUser";
import { cryptr, discord } from "~/server/utils/auth";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const stored_state = getCookie(event, "state") ?? null;
  const stored_redirect_url = getCookie(event, "redirect_to") ?? null;
  if (!code || !state || !stored_state || state !== stored_state) {
    setResponseStatus(event, 400);
    return sendRedirect(event, "/");
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code);
    const discord_user_response = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const provider_user: DiscordUser = await discord_user_response.json();

    const existing_user = await db
      .select({ id: users_table.id, banned: users_table.banned })
      .from(users_table)
      .where(eq(users_table.provider_id, provider_user.id));

    if (existing_user.length) {
      if (existing_user[0].banned) {
        setResponseStatus(event, 403);
        return sendRedirect(event, "/");
      }

      const session = await lucia.createSession(existing_user[0].id, {
        provider_access_token: cryptr.encrypt(tokens.accessToken),
        provider_access_token_refreshed_at: Date.now().toString(),
        provider_access_token_expires_at: tokens.accessTokenExpiresAt
          .getTime()
          .toString(),
        provider_refresh_token: cryptr.encrypt(tokens.refreshToken),
        created_at: Date.now().toString(),
      });
      const cookie = lucia.createSessionCookie(session.id);

      setCookie(
        event,
        cookie.name,
        cryptr.encrypt(cookie.value),
        cookie.attributes
      );
      deleteCookie(event, "redirect_to");

      if (stored_redirect_url && stored_redirect_url.startsWith("/")) {
        return sendRedirect(event, stored_redirect_url);
      }

      return sendRedirect(event, "/");
    }

    const user_id = generateId(32);

    const now = Date.now().toString();
    const created_user = await db
      .insert(users_table)
      .values({
        id: user_id,
        provider_id: provider_user.id,
        username: provider_user.username,
        avatar: provider_user.avatar!,
        display_name: provider_user.global_name!,
        email: provider_user.email!,
        created_at: now,
        updated_at: now,
      })
      .returning({ id: users_table.id });

    if (!created_user.length) {
      setResponseStatus(event, 500);
      return sendRedirect(event, "/");
    }

    const session = await lucia.createSession(created_user[0].id, {
      provider_access_token: cryptr.encrypt(tokens.accessToken),
      provider_access_token_refreshed_at: Date.now().toString(),
      provider_access_token_expires_at: tokens.accessTokenExpiresAt
        .getTime()
        .toString(),
      provider_refresh_token: cryptr.encrypt(tokens.refreshToken),
      created_at: Date.now().toString(),
    });
    const cookie = lucia.createSessionCookie(session.id);

    setCookie(
      event,
      cookie.name,
      cryptr.encrypt(cookie.value),
      cookie.attributes
    );

    return sendRedirect(event, "/");
  } catch (err) {
    console.log(err);

    // the specific error message depends on the provider
    if (err instanceof OAuth2RequestError) {
      // invalid code
      setResponseStatus(event, 400);
      return sendRedirect(event, "/");
    }
    setResponseStatus(event, 500);
    return sendRedirect(event, "/");
  }
});
