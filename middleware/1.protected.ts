export default defineNuxtRouteMiddleware(async (to, from) => {
  const lucia = useLucia();
  if (lucia.value === null) {
    return await navigateTo("/api/v1/auth/discord?redirect_to=" + to.path, {
      external: true,
    });
  }
});
