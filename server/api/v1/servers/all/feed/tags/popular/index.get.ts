import { and, desc, eq, isNull, not } from "drizzle-orm";

const get_popular_tags = (tags: string[][], limit: number): string[] => {
  // Flatten the array of arrays into a single array of tags
  const flattenedTags = tags.flat();

  // Create an object to store the counts of each tag
  const tagCounts: { [tag: string]: number } = {};

  // Count the occurrences of each tag
  flattenedTags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  // Convert the tag counts object into an array of [tag, count] pairs
  const tagCountArray = Object.entries(tagCounts);

  // Sort the array of tag count pairs by count in descending order
  tagCountArray.sort((a, b) => b[1] - a[1]);

  // Extract just the tags from the sorted array
  const popularTags = tagCountArray.map(([tag, _]) => tag);

  // Limit the number of popular tags
  const limitedPopularTags = popularTags.slice(0, limit);

  return limitedPopularTags;
};

export default defineEventHandler(async (event) => {
  // Parameters
  const query = getQuery(event);
  const limit = query.limit?.toString() || null;

  // 1. Check variables on server side to prevent abuse
  if (Number.isNaN(limit)) {
    setResponseStatus(event, 400);
    return { message: "Invalid limit query", result: null };
  }

  if (Number(limit) < 1) {
    // minimum page
    setResponseStatus(event, 400);
    return { message: "Invalid limit query (1-10)", result: null };
  }
  if (Number(limit) > 100) {
    // max pages
    setResponseStatus(event, 400);
    return { message: "Exceeded limit query (100 maximum)", result: null };
  }

  // 2. Reject banned users
  if (event.context.user?.banned) {
    setResponseStatus(event, 403);
    return { message: generic_error_banned, result: null };
  }

  // 3. Fetch servers
  try {
    const result = await database
      .select({ tags: servers_table.tags })
      .from(servers_table)
      .where(
        and(
          eq(servers_table.banned, false),
          eq(servers_table.public, true),
          not(isNull(servers_table.approved_at))
        )
      )
      .orderBy(desc(servers_table.bumped_at))
      .groupBy(servers_table.tags, servers_table.bumped_at)
      .limit(100); // only first 100 of the top bumped_at will be the results of the popular tags

    setResponseStatus(event, 200);
    return {
      message: null,
      result: get_popular_tags(
        result.map((row) => row.tags),
        Number(limit)
      ),
    };
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
      result: null,
    };
  }
});
