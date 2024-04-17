import { eq, lt } from "drizzle-orm";
import { cryptr, discord } from "~/server/utils/auth";
import db from "~/server/utils/database";
import { sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  if (getHeader(event, "Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return event.node.res.writeHead(403).end();

  try {
    await db
      .delete(sessions_table)
      .where(lt(sessions_table.expiresAt, sql`now()`));
    const sessions = await db
      .select({
        id: sessions_table.id,
        provider_access_token_expires_at:
          sessions_table.provider_access_token_expires_at,
        provider_refresh_token: sessions_table.provider_refresh_token,
      })
      .from(sessions_table);

    sessions.forEach(async (session) => {
      const expirationPeriodMs =
        Number(session.provider_access_token_expires_at) - new Date().getTime();
      const halfExpirationMs = expirationPeriodMs / 2;

      const thresholdDate = new Date();
      thresholdDate.setTime(thresholdDate.getTime() + halfExpirationMs);

      const currentDate = new Date();
      if (currentDate > thresholdDate) {
        const response = await discord.refreshAccessToken(
          cryptr.decrypt(session.provider_refresh_token)
        );

        if (
          !response.accessToken ||
          !response.refreshToken ||
          !response.accessTokenExpiresAt
        ) {
          await db
            .delete(sessions_table)
            .where(eq(sessions_table.id, session.id));
        } else {
          await db
            .update(sessions_table)
            .set({
              provider_access_token: cryptr.encrypt(response.accessToken),
              provider_access_token_expires_at: response.accessTokenExpiresAt
                .getTime()
                .toString(),
              provider_refresh_token: cryptr.encrypt(response.refreshToken),
            })
            .where(eq(sessions_table.id, session.id));
        }
      }
    });

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
