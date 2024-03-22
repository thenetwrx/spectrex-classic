export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("execute");
  const supabase = useSupabaseClient();
  const router = useRouter();

  const { data } = await supabase.auth.getSession();

  if (!data?.session) router.push("/login");
  if (data && data.session?.expires_at)
    if (data.session.expires_at > Date.now()) {
      // Session doesn't exist, try to refresh
      const { error } = await supabase.auth.signOut();
      router.push("/login");

      if (error) {
        // Handle the authentication error (e.g., redirect to login)
        console.error("Failed to logout session:", error);
      }
    }
});
