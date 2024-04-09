<template>
  <div class="w-16 h-16 overflow-hidden rounded-full">
    <div class="avatar" v-if="props.resource">
      <div class="rounded-full w-full">
        <NuxtImg alt="Resource Image" :src="props.resource" />
      </div>
    </div>
    <div class="h-full" v-else>
      <div class="rounded-full w-full h-full bg-secondary flex flex-col">
        <span class="text-xl opacity-50 m-auto">{{
          props.abbreviation || "?"
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    abbreviation: {
      type: String as PropType<string>,
      required: false,
    },
    resource: {
      type: String as PropType<string>,
      required: false,
    },
  });
</script>
