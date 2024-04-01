<template>
  <div class="container max-w-4xl mx-auto px-4 pt-32 min-h-screen text-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>

<script setup lang="ts">
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  navigateTo("https://discord.gg/wQPkC5aq", { external: true });
});
</script>
