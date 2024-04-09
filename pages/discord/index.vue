<template>
  <Container class="max-w-4xl text-center">
    <ResourcePending />
  </Container>
</template>

<script setup lang="ts">
  useHead({
    title: "Discord",
  });

  onMounted(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigateTo("https://discord.gg/87WuqtZdEy", { external: true });
  });
</script>
