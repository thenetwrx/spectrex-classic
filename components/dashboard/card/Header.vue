<template>
  <div class="bg-[#0a0a0a] w-full pt-4 px-6 flex flex-col">
    <p class="text-[22px] py-2">
      {{ title }}<span class="text-error" v-if="required">* </span>
      <span class="text-sm opacity-75" v-if="message">{{ message }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    title: {
      type: String as PropType<string>,
      required: true,
    },
    required: {
      type: Boolean as PropType<boolean>,
      required: false,
    },
    message: {
      type: String as PropType<string>,
      required: false,
    },
  });

  const { title, required, message } = props;
</script>
