<template>
  <div class="flex flex-col gap-1 w-full md:max-w-[16rem] max-md:pb-6">
    <NuxtLink
      class="transition-all duration-[150] rounded-md p-2"
      :class="
        active === 'servers' ? 'bg-base-300' : 'hover:bg-base-200 opacity-75'
      "
      href="/dashboard"
    >
      Servers
    </NuxtLink>
    <NuxtLink
      class="transition-all duration-[150] rounded-md p-2"
      :class="
        active === 'account' ? 'bg-base-300 ' : 'hover:bg-base-200 opacity-75'
      "
      href="/dashboard/account"
    >
      Account
    </NuxtLink>
    <NuxtLink
      class="transition-all duration-[150] rounded-md p-2"
      :class="
        active === 'profile' ? 'bg-base-300 ' : 'hover:bg-base-200 opacity-75'
      "
      href="/dashboard/profile"
    >
      Profile
    </NuxtLink>
    <NuxtLink
      v-if="lucia?.user.admin"
      class="transition-all duration-[150] rounded-md p-2"
      :class="
        active === 'admin' ? 'bg-base-300 ' : 'hover:bg-base-200 opacity-75'
      "
      href="/dashboard/admin"
    >
      Admin Panel
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
  const lucia = useLucia();

  const props = defineProps({
    active: {
      type: String as PropType<"servers" | "account" | "profile" | "admin">,
      required: true,
    },
  });

  const { active } = props;
</script>
