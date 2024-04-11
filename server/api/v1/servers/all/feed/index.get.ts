import pool from "~/server/utils/database";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const query = getQuery(event);
  const page = query.page?.toString() || "0";

  // 1. Check variables on server side to prevent abuse
  if (Number.isNaN(page)) {
    setResponseStatus(event, 400);
    return { message: "Invalid page query", result: null };
  }

  if (Number(page) < 0) {
    // minimum page
    setResponseStatus(event, 400);
    return { message: "Invalid page query (0-50)", result: null };
  }
  if (Number(page) > 50) {
    // max pages
    setResponseStatus(event, 400);
    return { message: "Exceeded page query (50 maximum)", result: null };
  }

  // 2. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 3. Fetch servers
  const client = await pool.connect();
  try {
    const max_per_page = 10;
    const category: string | null = query.category?.toString() || null;

    let servers;
    let sqlQuery = `
      SELECT * FROM servers  
      WHERE
          banned = false 
          AND public = true 
          AND approved_at IS NOT NULL
          ${category !== null ? `AND category = $1` : ``}
      ORDER BY bumped_at
      LIMIT ${max_per_page}
      OFFSET ${max_per_page * Number(page)}`;

    if (category?.length) {
      servers = await client.query<Server>(sqlQuery, [category]);
    } else {
      servers = await client.query<Server>(sqlQuery);
    }

    client.release();

    setResponseStatus(event, 200);
    return {
      message: null,
      result: servers.rows,
    };
  } catch (err) {
    console.log(err);

    client.release();

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
