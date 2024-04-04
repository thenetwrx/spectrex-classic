export default eventHandler(async (event) => {
  if (!event.context.session) {
    setResponseStatus(event, 401);
    return sendRedirect(event, "/");
  }

  // TODO: invalidate discord access token (when arctic supports it)

  await lucia.invalidateSession(event.context.session.id);
  appendHeader(
    event,
    "Set-Cookie",
    lucia.createBlankSessionCookie().serialize()
  );

  setResponseStatus(event, 200);
  return sendRedirect(event, "/");
});
