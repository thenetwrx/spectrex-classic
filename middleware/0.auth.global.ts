export default defineNuxtRouteMiddleware(async (to, from) => {
  const lucia = useLucia();
  if (lucia.value === null) {
    const data = await useRequestFetch()("/api/v1/auth/information");
    if (data) {
      lucia.value = data as any;
    } else lucia.value = null;
  }
});
