import { type Server } from "~/types/Server";

export default defineEventHandler(async (event) => {
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: "You are banned", result: null };
  }

  // Parameters
  const max_per_page = 10;
  const query = getQuery(event);
  const page = query.page;
  const category = query.category;

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
    if (category?.toString().length) {
      const servers = await database<Server[]>`
        select 
            *
        from servers
        where
            banned = false 
            and public = true 
            and approved_at is not null
            and category = ${category.toString()}
        order by bumped_at
        limit ${max_per_page}
        offset ${max_per_page * Number(page)}
        `;

      if (servers.length) {
        setResponseStatus(event, 200);
        return {
          message: null,
          result: servers,
        };
      }
    } else {
      const servers = await database<Server[]>`
        select 
            *
        from servers
        where
            banned = false 
            and public = true 
            and approved_at is not null
        order by bumped_at
        limit ${max_per_page}
        offset ${max_per_page * Number(page)}
        `;

      if (servers.length) {
        setResponseStatus(event, 200);
        return {
          message: null,
          result: servers,
        };
      }
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
