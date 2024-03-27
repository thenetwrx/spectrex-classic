<template>
  <div class="container max-w-4xl mx-auto px-4 py-8 text-center">
    <div class="w-full text-center mt-12" v-if="profile_pending">
      <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
    </div>
    <p class="text-4xl" v-else-if="!profile?.result?.length">
      Hm... That profile doesn't seem to exist!
    </p>
    <template v-else>
      <div class="w-full flex flex-row gap-2 items-center">
        <div class="ml-auto flex flex-row gap-1">
          <NuxtLink
            class="btn btn-ghost btn-sm"
            href="/dashboard/profile"
            v-if="profile.result[0].id === user?.id"
          >
            Edit <i class="fa-solid fa-pen-to-square"></i>
          </NuxtLink>
          <button
            class="btn btn-ghost btn-sm"
            :class="syncing ? 'btn-disabled' : ''"
            v-if="
              profile.result[0].provider_id === user?.user_metadata.provider_id
            "
            @click.stop="syncProfile"
          >
            <span v-if="syncing">Syncing...</span>
            <span v-else>Sync</span>
            <i
              class="fa-solid fa-arrows-rotate"
              :class="syncing ? 'fa-spin' : ''"
            ></i>
          </button>
          <button class="btn btn-ghost btn-sm" @click="copy_current_url">
            Copy <i class="fa-solid fa-link"></i>
          </button>
        </div>
      </div>
      <div class="flex flex-col py-4">
        <div class="bg-base-200 w-full h-fit p-2 rounded-t-md">
          <div class="flex flex-wrap gap-2 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-full">
              <img
                v-if="profile.result[0].avatar_url !== null"
                :src="profile.result[0].avatar_url"
                alt="Server Image"
                class="object-cover w-full h-full"
              />
              <div
                v-else
                class="h-full flex flex-col items-center rounded-full bg-base-100"
              >
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{
                    profile.result[0].global_name.slice(0, 1).toUpperCase() ||
                    "?"
                  }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-medium text-lg">
                <i
                  class="fa-solid fa-crown text-accent"
                  v-if="profile.result[0].premium_since !== null ? true : false"
                ></i>
                {{ profile.result[0].global_name }}
              </span>
              <p class="opacity-50">@{{ profile.result[0].full_name }}</p>
            </div>
          </div>
        </div>
        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col"
        >
          <div>
            <p class="text-2xl pb-2">Description</p>

            <p class="opacity-50">
              {{ profile.result[0].description || "No description provided" }}
            </p>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div>
        <p class="text-2xl pt-10">Reviews</p>
        <p class="opacity-50">
          No reviews yet...
          <NuxtLink href="#" class="text-primary">Create one!</NuxtLink>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import useClipboard from "~/composables/useClipboard";
const route = useRoute();
const user = useSupabaseUser();
const client = useSupabaseClient();
const user_id = route.params.id;

const syncing = ref<boolean>(false);

const {
  data: profile,
  refresh: refreshProfile,
  pending: profile_pending,
} = useFetch(
  `/api/v1/profiles/fetch/${user.value?.user_metadata.provider_id}`,
  { retry: false }
);

const copy_current_url = async () => {
  const { toClipboard } = useClipboard();
  toClipboard(window.location.href);
};

const syncProfile = async () => {
  syncing.value = true;
  const response = await fetch("/api/v1/profiles/sync/" + user_id);
  if (response.status === 401) {
    await client.auth.signOut();
    navigateTo("/login");
  }
  refreshProfile();
  syncing.value = false;
};
</script>
