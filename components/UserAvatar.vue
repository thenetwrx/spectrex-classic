<template>
  <div class="w-16 h-16 overflow-hidden rounded-lg">
    <div class="avatar" v-if="resource.avatar">
      <div class="rounded-full w-full">
        <img
          alt="Resource Image"
          :src="discord.cdn.user_avatar(resource.provider_id, resource.avatar)"
          v-on:error="resource.avatar = null"
          :on-error="() => (resource.avatar = null)"
        />
      </div>
    </div>
    <div class="h-full" v-else>
      <div class="rounded-full w-full h-full bg-secondary flex flex-col">
        <span class="text-xl opacity-50 m-auto">{{
          resource.username.slice(0, 2).toUpperCase()
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const discord = useDiscord();

  const props = defineProps({
    resource: {
      type: Object as PropType<typeof users_table.$inferSelect>,
      required: true,
    },
  });

  const { resource } = props;
</script>
