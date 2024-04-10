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
    const { rows: sessions } = await client.query(`
        SELECT * FROM sessions;
    `);

    sessions.forEach(async (session) => {
      const two_days_in_ms = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
      const token_expires_in_ms =
        Number(session.provider_access_token_expires_at) - Date.now();

      // Check if the current date is greater than half of the token expiration date
      if (token_expires_in_ms < two_days_in_ms / 2) {
        const response = await discord.refreshAccessToken(
          cryptr.decrypt(session.provider_refresh_token)
        );

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
