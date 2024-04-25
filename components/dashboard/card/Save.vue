<template>
  <ClientOnly>
    <div class="bg-base-200 flex flex-col py-2 px-6 border-t border-secondary">
      <button
        class="btn btn-primary btn-sm w-fit ml-auto"
        :class="pending || matches() ? 'btn-disabled' : ''"
        v-on:click="execute"
      >
        {{ pending ? "Saving" : "Save" }}
        <span v-if="pending" class="loading loading-spinner loading-xs"></span>
      </button>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  const pending = ref<boolean>(false);

  const props = defineProps({
    callback: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
    matches: {
      type: Function as PropType<() => boolean>,
      required: true,
    },
  });

  const execute = async () => {
    pending.value = true;
    await props.callback();
    pending.value = false;
  };
</script>
