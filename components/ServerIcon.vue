<template>
  <div class="w-16 h-16 overflow-hidden rounded-lg">
    <div class="avatar" v-if="resource?.icon">
      <div class="rounded-full w-full">
        <img
          alt="Resource Image"
          :src="discord.cdn.server_icon(resource.provider_id, resource.icon)"
          v-on:error="resource.icon = null"
          :on-error="() => resource && (resource.icon = null)"
        />
      </div>
    </div>
    <div class="h-full" v-else>
      <div class="rounded-full w-full h-full bg-secondary flex flex-col">
        <span class="text-xl opacity-50 m-auto">{{
          resource?.name.slice(0, 2).toUpperCase() || "?"
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const discord = useDiscord();

  const props = defineProps({
    resource: {
      type: Object as PropType<typeof servers_table.$inferSelect>,
      required: false,
    },
  });

  const { resource } = props;
</script>
