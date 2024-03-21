// composables/useSessionRefresh.js
export const useSessionRefresh = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const checkAndRefresh = async () => {
    const { data } = await supabase.auth.getSession();

    if (data && data.session?.expires_at)
      if (data.session.expires_at >= Date.now()) {
        // Session doesn't exist, try to refresh
        const { error } = await supabase.auth.signOut();
        router.push("/login");

        if (error) {
          // Handle the authentication error (e.g., redirect to login)
          console.error("Failed to logout session:", error);
        }
      }
  };

  return { checkAndRefresh };
};
