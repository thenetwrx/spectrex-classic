export default eventHandler(async (event) => {
  if (!event.context.session) {
    return;
  }

  // TODO: invalidate discord access token (when arctic supports it)

  await lucia.invalidateSession(event.context.session.id);
  appendHeader(
    event,
    "Set-Cookie",
    lucia.createBlankSessionCookie().serialize()
  );

  return;
});
