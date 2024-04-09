<template>
  <FallbackContainer>
    <span>{{ props.message || "Resource not found" }}</span>
  </FallbackContainer>
</template>

<script setup lang="ts">
  const props = defineProps({
    message: {
      type: String as PropType<string>,
      required: false,
    },
  });
</script>
