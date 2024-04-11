export default defineNuxtRouteMiddleware(async (to, from) => {
  const lucia = useLucia();
  if (!lucia.value?.user.admin) {
    return await navigateTo("/", {
      external: true,
    });
  }
});
