export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useUser();
  if (user.value === null) {
    return await navigateTo("/api/v1/auth/discord", { external: true });
  }
});
