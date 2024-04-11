import { OAuth2RequestError } from "arctic";
import { User, generateId } from "lucia";
import pool from "~/server/utils/database";
import DiscordUser from "~/types/DiscordUser";
import { cryptr, discord } from "~/server/utils/auth";

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

  const client = await pool.connect();
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

    const { rows: existing_user } = await client.query<User>(
      `
      SELECT id FROM users
      WHERE
        provider_id = $1
    `,
      [provider_user.id]
    );

    if (existing_user.length) {
      if (existing_user[0].banned) {
        client.release();

        setResponseStatus(event, 403);
        return sendRedirect(event, "/");
      }

      const session = await lucia.createSession(existing_user[0].id, {
        provider_access_token: cryptr.encrypt(tokens.accessToken),
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

      client.release();

      if (stored_redirect_url && stored_redirect_url.startsWith("/")) {
        return sendRedirect(event, stored_redirect_url);
      }

      return sendRedirect(event, "/");
    }

    const user_id = generateId(32);

    const { rows: created_user } = await client.query(
      `
      INSERT INTO users
        (id, provider_id, username, avatar, display_name, email, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING id
    `,
      [
        user_id,
        provider_user.id,
        provider_user.username,
        provider_user.avatar!,
        provider_user.global_name!,
        provider_user.email!,
        Date.now().toString(),
      ]
    );

    if (!created_user.length) {
      client.release();

      setResponseStatus(event, 500);
      return sendRedirect(event, "/");
    }

    const session = await lucia.createSession(created_user[0].id, {
      provider_access_token: cryptr.encrypt(tokens.accessToken),
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

    client.release();

    return sendRedirect(event, "/");
  } catch (err) {
    console.log(err);

    client.release();
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
