export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useUser();
  if (user.value === null) {
    const data = await useRequestFetch()("/api/v1/auth/user");
    if (data) {
      user.value = data;
    } else user.value = null;
  }
});
