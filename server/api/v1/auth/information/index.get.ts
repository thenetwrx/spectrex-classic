export default defineEventHandler((event) => {
  if (event.context.user && event.context.session)
    return { user: event.context.user, session: event.context.session };
  return null;
});
