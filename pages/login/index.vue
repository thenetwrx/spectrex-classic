<script setup lang="ts">
const client = useSupabaseClient();

await client.auth.signInWithOAuth({
  provider: "discord",
  options: {
    scopes: "guilds",
    redirectTo: "https://spectrex.app/auth/callback",
  },
});
</script>

<template>
  <div class="w-full text-center mt-12">
    <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
  </div>
</template>
