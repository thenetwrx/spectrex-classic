export default defineEventHandler(async (event) => {
  if (getHeader(event, "Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return event.node.res.writeHead(403).end();

  try {
    await lucia.deleteExpiredSessions();

    return;
  } catch (err) {
    console.log(err);

    setResponseStatus(event, 500);
    return {
      message: generic_error_unknown_error,
    };
  }
});
