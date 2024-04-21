import { verifyRequestOrigin } from "lucia";
import type { Session, User } from "lucia";
import { cryptr } from "../utils/auth";
import db from "../utils/database";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    const originHeader = getHeader(event, "Origin") ?? null;
    const hostHeader = getHeader(event, "Host") ?? null;
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return event.node.res.writeHead(403).end();
    }
  }

  try {
    const signedCookie = getCookie(event, lucia.sessionCookieName) ?? null;
    const sessionId = cryptr.decrypt(signedCookie!);

    if (!sessionId) throw Error();

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      appendResponseHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(cryptr.encrypt(session.id)).serialize()
      );
    }
    if (!session) {
      appendResponseHeader(
        event,
        "Set-Cookie",
        lucia.createBlankSessionCookie().serialize()
      );
    }

    // Assuming session.provider_access_token_refreshed_at is in milliseconds
    const refreshedTimeMs = Number(session?.provider_access_token_refreshed_at);
    const oneDayMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds

    // Calculate the time one day after the refreshed time
    const oneDayAfterRefreshedMs = refreshedTimeMs + oneDayMs;

    // Check if the current time is greater than or equal to one day after the refreshed time
    if (Date.now() >= oneDayAfterRefreshedMs) {
      console.log("yes");
      const response = await discord.refreshAccessToken(
        cryptr.decrypt(session?.provider_refresh_token!)
      );

      console.log(response);

      if (
        !response.accessToken ||
        !response.refreshToken ||
        !response.accessTokenExpiresAt
      ) {
        // refresh failed, so just delete the session
        await db.delete(sessions_table).where(eq(sessions_table.id, sessionId));

        event.context.session = null;
        event.context.user = null;
      } else {
        await db
          .update(sessions_table)
          .set({
            provider_access_token: cryptr.encrypt(response.accessToken),
            provider_access_token_refreshed_at: Date.now().toString(),
            provider_access_token_expires_at: response.accessTokenExpiresAt
              .getTime()
              .toString(),
            provider_refresh_token: cryptr.encrypt(response.refreshToken),
          })
          .where(eq(sessions_table.id, sessionId));

        event.context.session = session;
        event.context.user = user;
      }
    } else {
      event.context.session = session;
      event.context.user = user;
    }
  } catch (err) {
    event.context.session = null;
    event.context.user = null;

    return;
  }
});

declare module "h3" {
  interface H3EventContext {
    user: User | null;
    session: Session | null;
  }
}
