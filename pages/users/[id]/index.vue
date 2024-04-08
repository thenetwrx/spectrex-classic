<template>
  <div class="container max-w-4xl mx-auto px-4 pt-32 min-h-screen text-center">
    <FallbackContainer v-if="profile_pending">
      <span class="loading loading-spinner loading-lg"></span>
    </FallbackContainer>
    <FallbackContainer v-else-if="!profile?.result">
      <span>Resource not found</span>
    </FallbackContainer>
    <template v-else>
      <div class="w-full flex flex-row gap-2 items-center">
        <div
          class="ml-auto flex flex-wrap gap-1 w-fit max-sm:max-w-fit overflow-x-auto"
        >
          <NuxtLink
            class="btn btn-ghost btn-sm"
            href="/dashboard/account"
            v-if="profile.result.id === lucia?.user?.id"
          >
            Edit <i class="fa-solid fa-pen-to-square"></i>
          </NuxtLink>
          <button
            class="btn btn-ghost btn-sm"
            :class="syncing ? 'btn-disabled' : ''"
            v-if="profile.result.id === lucia?.user?.id"
            v-on:click="syncProfile"
          >
            <span v-if="syncing">Syncing</span>
            <span v-else>Sync</span>
            <i
              class="fa-solid fa-arrows-rotate"
              :class="syncing ? 'fa-spin' : ''"
            ></i>
          </button>
          <button class="btn btn-ghost btn-sm" v-on:click="copy_current_url">
            Copy <i class="fa-solid fa-link"></i>
          </button>
        </div>
      </div>
      <div class="flex flex-col py-4">
        <div class="bg-base-200 w-full h-fit p-2 rounded-t-md">
          <div class="flex flex-wrap gap-2 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-full">
              <div class="avatar" v-if="profile.result.avatar">
                <div class="rounded-full w-full">
                  <NuxtImg
                    provider="cloudflare"
                    alt="User Image"
                    :src="
                      discordCdn.user_avatar(
                        profile.result.discord_id,
                        profile.result.avatar
                      )
                    "
                  />
                </div>
              </div>
              <div class="h-full" v-else>
                <div
                  class="rounded-full w-full h-full bg-secondary flex flex-col"
                >
                  <span class="text-xl opacity-50 m-auto">{{
                    profile.result.global_name?.slice(0, 2).toUpperCase() || "?"
                  }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-start">
              <p
                class="font-medium text-lg"
                :class="
                  profile.result.premium_since !== null ? 'text-[#ffbf28]' : ''
                "
              >
                <i
                  class="fa-solid fa-crown"
                  v-if="profile.result.premium_since !== null ? true : false"
                ></i>
                {{ profile.result.global_name || profile.result.username }}
              </p>

              <p class="opacity-50">@{{ profile.result.username }}</p>
            </div>
          </div>
        </div>
        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col"
        >
          <div>
            <p class="text-2xl pb-2">Description</p>

            <p class="opacity-50">
              {{ profile.result.description || "No description provided" }}
            </p>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="py-12">
        <p class="text-2xl">Reviews</p>
        <p class="opacity-50">
          No reviews yet...
          <NuxtLink href="#" class="text-accent">Create one!</NuxtLink>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import useClipboard from "~/composables/useClipboard";

  const lucia = useLucia();
  const discordCdn = useDiscordCdn();

  const route = useRoute();
  const user_id = route.params.id;

  const syncing = ref<boolean>(false);

  const {
    data: profile,
    refresh: refreshProfile,
    pending: profile_pending,
  } = useFetch(`/api/v1/users/${user_id}/fetch`, { retry: false });

  const copy_current_url = async () => {
    const { toClipboard } = useClipboard();
    toClipboard(window.location.href);
  };

  const syncProfile = async () => {
    syncing.value = true;
    const response = await fetch("/api/v1/users/me/sync");
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    refreshProfile();
    syncing.value = false;
  };
</script>
