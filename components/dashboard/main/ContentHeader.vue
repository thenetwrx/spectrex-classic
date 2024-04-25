<template>
  <div class="flex flex-row items-center">
    <h2 class="text-lg font-semibold">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    title: {
      type: String as PropType<string>,
      required: true,
    },
  });

  const { title } = props;
</script>
