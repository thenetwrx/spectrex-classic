<template>
  <div class="bg-[#0a0a0a] flex flex-col py-2 px-6 border-t border-secondary">
    <NuxtLink
      class="btn btn-primary btn-sm w-fit ml-auto"
      :class="disabled ? 'btn-disabled' : ''"
      :href="link"
    >
      {{ message }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
  const pending = ref<boolean>(false);

  const props = defineProps({
    link: {
      type: String as PropType<string>,
      required: true,
    },
    message: {
      type: String as PropType<string>,
      required: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      required: false,
    },
  });

  const { link, message } = props;
</script>
