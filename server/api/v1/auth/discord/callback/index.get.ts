import { OAuth2RequestError, Discord } from "arctic";
import { generateId } from "lucia";
import database from "~/server/utils/database";
import Cryptr from "cryptr";

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  process.env.BASE_URL! + "/api/v1/auth/discord/callback"
);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(event, "discord_oauth_state") ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    setResponseStatus(event, 400);
    return sendRedirect(event, "/");
  }

  try {
    const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

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

    // Replace this with your own DB client.
    const existingUser = await database`
      select 
        id
      from users
      where discord_id = ${discordUser.id}
    `;

    if (existingUser.length) {
      const session = await lucia.createSession(existingUser[0].id, {
        discord_access_token: cryptr.encrypt(tokens.accessToken),
      });
      const cookie = lucia.createSessionCookie(session.id);
      setCookie(event, cookie.name, cookie.value, cookie.attributes);
      return sendRedirect(event, "/");
    }

    const userId = generateId(15);

    const createdUser = await database`
      insert into users
        (id, discord_id, username, avatar, global_name, email)
      values
        (${userId}, ${discordUser.id}, ${discordUser.username}, ${discordUser.avatar}, ${discordUser.global_name}, ${discordUser.email})
      returning id
    `;

    if (!createdUser.length) {
      setResponseStatus(event, 500);
      return sendRedirect(event, "/");
    }

    const session = await lucia.createSession(createdUser[0].id, {
      discord_access_token: cryptr.encrypt(tokens.accessToken),
    });
    const cookie = lucia.createSessionCookie(session.id);

    setCookie(event, cookie.name, cookie.value, cookie.attributes);
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

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
  email: string | null;
}
