<template>
  <div class="flex flex-col">
    <div class="bg-base-200 rounded-t-md">
      <div class="flex flex-row items-center gap-2 w-full p-2 relative">
        <div class="w-16 h-16 overflow-hidden rounded-lg">
          <NuxtLink :href="'/servers/' + server.discord_id">
            <img
              v-if="server.icon"
              :src="discordCdn.server_icon(server.discord_id, server.icon)"
              alt="Server Image"
              class="object-cover rounded-full w-full h-full"
              :class="server.nsfw ? 'blur-sm' : ''"
            />
            <div
              v-else
              class="h-full flex flex-col items-center rounded-full bg-base-100"
            >
              <p class="opacity-50 mt-auto mb-auto text-3xl">
                {{ server.name.slice(0, 1).toUpperCase() || "?" }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div class="flex flex-col">
          <NuxtLink :href="'/servers/' + server.discord_id">
            <span class="font-medium text-lg">{{ server.name }}</span>
          </NuxtLink>
          <div class="flex flex-wrap gap-1 items-center">
            <div class="bg-accent bg-opacity-50 px-1 rounded-md">
              <span class="opacity-75">{{ server.category }}</span>
            </div>
            <div
              class="bg-error bg-opacity-50 px-1 rounded-md"
              v-if="server.nsfw"
            >
              <span class="opacity-75">NSFW</span>
            </div>
            <div class="flex flex-row gap-1 items-center">
              <div class="bg-[#23A55A] h-4 w-4 rounded-full"></div>
              <p class="opacity-50">
                {{ server.approximate_presence_count }} online
              </p>
            </div>
          </div>
        </div>
        <div
          class="absolute top-1 right-1 flex flex-row gap-1 items-center justify-start"
        >
          <NuxtLink
            :href="'/servers/' + server.discord_id + '/report'"
            class="btn btn-ghost max-sm:btn-sm"
          >
            <i class="fa-solid md:fa-lg fa-flag"></i>
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="bg-base-300 rounded-b-md py-2 px-4">
      <template v-if="server.tags.length">
        <div
          class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto my-2"
        >
          <span
            v-for="tag in server.tags"
            class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
          >
            <span class="text-accent">#</span>
            {{ tag }}
          </span>
        </div>
        <div class="divider m-0"></div>
      </template>

      <p class="opacity-75 break-words">{{ server.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type Server from "~/types/Server";

  const discordCdn = useDiscordCdn();

  const props = defineProps({
    server: {
      type: Object as PropType<Server>,
      required: true,
    },
  });

  const { server } = props;
</script>
