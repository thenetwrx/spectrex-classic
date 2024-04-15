<template>
  <div class="flex items-center justify-between mb-8">
    <div class="flex flex-row items-center gap-2">
      <div class="w-16 h-16 overflow-hidden rounded-full">
        <div class="avatar" v-if="lucia?.user?.avatar">
          <div class="rounded-full w-full">
            <NuxtImg
              alt="Resource Image"
              :src="
                discord.cdn.user_avatar(
                  lucia.user.provider_id,
                  lucia.user.avatar
                )
              "
            />
          </div>
        </div>
        <div class="h-full" v-else>
          <div class="rounded-full w-full h-full bg-secondary flex flex-col">
            <span class="text-xl opacity-50 m-auto">{{
              lucia?.user?.display_name?.slice(0, 2).toUpperCase() || "?"
            }}</span>
          </div>
        </div>
      </div>
      <div>
        <h2 class="text-lg">
          Welcome back,
          <span
            :class="lucia?.user?.premium_since !== null ? 'text-[#ffbf28]' : ''"
          >
            <i
              class="fa-solid fa-crown"
              v-if="lucia?.user?.premium_since !== null ? true : false"
            ></i>
            {{
              lucia?.user?.display_name || lucia?.user?.username || "Unknown"
            }}
          </span>
        </h2>
        <p class="opacity-30">
          Logged in at: {{ formatDateString(lucia?.session?.created_at!) }}
        </p>
      </div>
    </div>
  </div>
  <h2 class="text-lg font-semibold">Dashboard</h2>
  <div class="divider"></div>
</template>

<script setup lang="ts">
  const lucia = useLucia();
  const discord = useDiscord();

  function formatDateString(dynamicString: string) {
    const date = new Date(Number(dynamicString));

    return date ? date.toString() : "Unknown";
  }
</script>
