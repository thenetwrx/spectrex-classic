<template>
  <div class="flex items-center justify-between mb-8">
    <div class="flex flex-row items-center gap-2">
      <UserAvatar :resource="lucia?.user" />
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
