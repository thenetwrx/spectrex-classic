<template>
  <div class="flex items-center justify-between mb-8">
    <div
      class="flex flex-row items-center gap-2 max-md:flex-col max-md:items-start"
    >
      <UserAvatar :resource="lucia?.user" />
      <div>
        <h2 class="text-lg">
          Hey there,
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
          You logged in on
          <NuxtTime
            v-if="lucia?.session?.created_at"
            :datetime="new Date(lucia.session.created_at)"
            time-style="full"
            date-style="full"
          />
          <span v-else>Unknown</span>
        </p>
      </div>
    </div>
  </div>
  <h2 class="text-lg font-semibold">Dashboard</h2>
  <div class="divider"></div>
</template>

<script setup lang="ts">
  const lucia = useLucia();
</script>
