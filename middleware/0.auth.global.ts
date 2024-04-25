import type { User, Session } from "lucia";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const lucia = useLucia();
  if (lucia.value === null) {
    const data: { user: User; session: Session } | null =
      await useRequestFetch()("/api/v1/auth/information");
    if (data) {
      lucia.value = data;
    } else lucia.value = null;
  }
});
