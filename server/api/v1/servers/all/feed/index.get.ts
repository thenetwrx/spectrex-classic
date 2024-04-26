import db from "~/server/utils/database";
import { eq, and, not, isNull, getTableColumns, asc, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Parameters
  const query = getQuery(event);
  const page = query.page?.toString();
  const limit = query.limit?.toString();
  const sort = query.sort?.toString();

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

  if (Number.isNaN(limit)) {
    setResponseStatus(event, 400);
    return { message: "Invalid page query", result: null };
  }

  if (Number(limit) < 1) {
    // minimum page
    setResponseStatus(event, 400);
    return { message: "Invalid limit query (1-20)", result: null };
  }
  if (Number(limit) > 20) {
    // max pages
    setResponseStatus(event, 400);
    return { message: "Exceeded limit query (20 maximum)", result: null };
  }

  if (!sort?.length) {
    setResponseStatus(event, 400);
    return { message: "Missing sort query", result: null };
  }
  if (
    !["bumped_at", "approximate_member_count"].some((type) => sort === type)
  ) {
    setResponseStatus(event, 400);
    return { message: "Invalid sort query", result: null };
  }

  if (event.context.user?.banned) {
    // 2. Reject banned users
    setResponseStatus(event, 403);
    return { message: "You're banned from Spectrex", result: null };
  }

  // 3. Fetch servers
  try {
    const max_per_page = Number(limit);
    const category: string | null = query.category?.toString() || null;

    const amount = await db
      .select({ id: servers_table.id })
      .from(servers_table)
      .where(
        and(
          eq(servers_table.banned, false),
          eq(servers_table.public, true),
          not(isNull(servers_table.approved_at)),
          category?.length ? eq(servers_table.category, category!) : undefined
        )
      );

    const { invite_link, invite_uses, ...rest } =
      getTableColumns(servers_table); // exclude "invite_link" column
    const servers = await db
      .select({ ...rest })
      .from(servers_table)
      .where(
        and(
          eq(servers_table.banned, false),
          eq(servers_table.public, true),
          not(isNull(servers_table.approved_at)),
          category?.length ? eq(servers_table.category, category!) : undefined
        )
      )
      .orderBy(
        sort === "bumped_at"
          ? desc(servers_table.bumped_at)
          : desc(servers_table.approximate_member_count)
      )
      .limit(max_per_page)
      .offset(max_per_page * Number(page));

    setResponseStatus(event, 200);
    return {
      message: null,
      result: servers,
      amount: amount.length,
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: "An unknown error occurred, try again later",
      result: null,
    };
  }
});
