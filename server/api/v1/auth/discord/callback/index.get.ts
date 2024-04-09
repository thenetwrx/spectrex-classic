import { OAuth2RequestError } from "arctic";
import { User, generateId } from "lucia";
import pool from "~/server/utils/database";
import DiscordUser from "~/types/DiscordUser";
import { cryptr, discord } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(event, "state") ?? null;
  const storedRedirectUri = getCookie(event, "redirect_to") ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    setResponseStatus(event, 400);
    return sendRedirect(event, "/");
  }

  const client = await pool.connect();
  try {
    const tokens = await discord.validateAuthorizationCode(code);
    const discordUserResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const discordUser: DiscordUser = await discordUserResponse.json();

    const { rows: existingUser } = await client.query<User>(
      `
      SELECT id FROM users
      WHERE
        discord_id = $1
    `,
      [discordUser.id]
    );

    if (existingUser.length) {
      const session = await lucia.createSession(existingUser[0].id, {
        discord_access_token: cryptr.encrypt(tokens.accessToken),
        discord_access_token_expires_at: cryptr.encrypt(
          tokens.accessTokenExpiresAt.getTime().toString()
        ),
        discord_refresh_token: cryptr.encrypt(tokens.refreshToken),
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

      if (storedRedirectUri && storedRedirectUri.startsWith("/")) {
        return sendRedirect(event, storedRedirectUri);
      }

      return sendRedirect(event, "/");
    }

    const userId = generateId(32);

    const { rows: createdUser } = await client.query(
      `
      INSERT INTO users
        (id, discord_id, username, avatar, global_name, email, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING id
    `,
      [
        userId,
        discordUser.id,
        discordUser.username,
        discordUser.avatar!,
        discordUser.global_name!,
        discordUser.email!,
        Date.now().toString(),
      ]
    );

    if (!createdUser.length) {
      client.release();

      setResponseStatus(event, 500);
      return sendRedirect(event, "/");
    }

    const session = await lucia.createSession(createdUser[0].id, {
      discord_access_token: cryptr.encrypt(tokens.accessToken),
      discord_access_token_expires_at: cryptr.encrypt(
        tokens.accessTokenExpiresAt.getTime().toString()
      ),
      discord_refresh_token: cryptr.encrypt(tokens.refreshToken),
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
