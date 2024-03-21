<script setup lang="ts">
const client = useSupabaseClient();

const res = await client.auth.signInWithOAuth({
  provider: "discord",
  options: {
    redirectTo: "/",
    scopes: "guilds",
  },
});
</script>

<template>
  <div class="w-full text-center mt-12">
    <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
  </div>
</template>
