<template>
  <div class="flex flex-col gap-1 w-full md:max-w-xs">
    <NuxtLink
      :class="
        active === 'servers'
          ? 'bg-base-200 rounded-md p-2'
          : 'hover:bg-base-200 rounded-md p-2 opacity-75'
      "
      href="/dashboard"
    >
      Servers
    </NuxtLink>
    <NuxtLink
      :class="
        active === 'account'
          ? 'bg-base-200 rounded-md p-2'
          : 'hover:bg-base-200 rounded-md p-2 opacity-75'
      "
      href="/dashboard/account"
      >Account</NuxtLink
    >
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    active: {
      type: String as PropType<"servers" | "account">,
      required: true,
    },
  });

  const { active } = props;
</script>
