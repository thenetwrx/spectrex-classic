import pool from "~/server/utils/database";
import type Server from "~/types/Server";

export default defineEventHandler(async (event) => {
  // Parameters
  const query = getQuery(event);
  const page = query.page?.toString() || "0";
  // const sort = query.sort?.toString() || "bumped_at";

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

  // if (
  //   !["bumped_at", "approximate_member_count"].some((type) => type === sort)
  // ) {
  //   setResponseStatus(event, 400);
  //   return { message: "Invalid sort query", result: null };
  // }

  // 3. Fetch servers
  const client = await pool.connect();
  try {
    const max_per_page = 10;
    const category: string | null = query.category?.toString() || null;

    let feed;
    let servers;

    let filtered_sql_query = `
      SELECT * FROM servers  
      WHERE
          banned = false 
          AND public = true 
          AND approved_at IS NOT NULL
          ${category !== null ? `AND category = $1` : ``}
      ORDER BY bumped_at DESC`;

    if (category?.length) {
      servers = await client.query<Server>(filtered_sql_query, [category]);
      feed = await client.query<Server>(
        filtered_sql_query +
          `\nLIMIT ${max_per_page}
      OFFSET ${max_per_page * Number(page)}`,
        [category]
      );
    } else {
      servers = await client.query<Server>(filtered_sql_query);

      feed = await client.query<Server>(
        filtered_sql_query +
          `\nLIMIT ${max_per_page}
      OFFSET ${max_per_page * Number(page)}`
      );
    }

    client.release();

    setResponseStatus(event, 200);
    return {
      message: null,
      result: feed.rows,
      amount: servers.rows.length,
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
