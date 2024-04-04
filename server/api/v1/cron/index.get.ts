import { Discord } from "arctic";
import Cryptr from "cryptr";
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
      const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);
      if (
        Number(cryptr.decrypt(session.discord_access_token_expires_at)) <
        Date.now()
      ) {
        // discord access token is expired, refresh it and update shit

        const discord = new Discord(
          process.env.DISCORD_CLIENT_ID!,
          process.env.DISCORD_CLIENT_SECRET!,
          ""
        );

        const response = await discord.refreshAccessToken(
          cryptr.decrypt(session.discord_refresh_token)
        );

        await client.query(
          `
        UPDATE sessions
        SET discord_access_token = $1, discord_access_token_expires_at = $2, discord_refresh_token = $3
        WHERE
            id = $4
      `,
          [
            cryptr.encrypt(response.accessToken),
            cryptr.encrypt(response.accessTokenExpiresAt.getTime().toString()),
            cryptr.encrypt(response.refreshToken),
            session.id,
          ]
        );
      }
    });

    client.release();

    setResponseStatus(event, 200);
    return {
      message: null,
    };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
    };
  }
});
