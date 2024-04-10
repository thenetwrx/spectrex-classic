import { Session } from "lucia";
import { cryptr, discord } from "~/server/utils/auth";
import pool from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  if (getHeader(event, "Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return event.node.res.writeHead(403).end();

  const client = await pool.connect();
  try {
    await client.query(`
      DELETE FROM sessions 
      WHERE expires_at < NOW()
    `);
    const { rows: sessions } = await client.query<Session>(`
        SELECT * FROM sessions;
    `);

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
          await client.query(
            `
            DELETE FROM sessions 
            WHERE id = $1
          `,
            [session.id]
          );
        } else {
          await client.query(
            `
            UPDATE sessions
            SET provider_access_token = $1, provider_access_token_expires_at = $2, provider_refresh_token = $3
            WHERE
                id = $4
          `,
            [
              cryptr.encrypt(response.accessToken),
              response.accessTokenExpiresAt.getTime().toString(),
              cryptr.encrypt(response.refreshToken),
              session.id,
            ]
          );
        }
      }
    });

    client.release();

    return;
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
