import { type Server } from "~/types/Server";

export default defineEventHandler(async (event) => {
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // Parameters

  const query = getQuery(event);
  const page = query.page;

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

  // 2. Fetch guilds
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
      servers = await database.query<Server>(sqlQuery, [category]);
    } else {
      servers = await database.query<Server>(sqlQuery);
    }

    if (servers.rows.length) {
      setResponseStatus(event, 200);
      return {
        message: null,
        result: servers.rows,
      };
    }

    setResponseStatus(event, 404);
    return { message: "No servers found", result: null };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
