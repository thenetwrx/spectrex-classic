<template>
  <div class="container max-w-4xl mx-auto px-4 py-8 text-center">
    <p class="text-4xl" v-if="!profile?.data?.length">
      Hm... That profile doesn't seem to exist!
    </p>
    <template v-else>
      <div class="w-full flex flex-row gap-2 items-center">
        <div class="ml-auto flex flex-row gap-1">
          <NuxtLink
            class="btn btn-ghost btn-sm"
            href="/dashboard/profile"
            v-if="profile.data[0].id === user?.id"
          >
            Edit <i class="fa-solid fa-pen-to-square"></i>
          </NuxtLink>
          <button
            class="btn btn-ghost btn-sm"
            :class="syncing ? 'btn-disabled' : ''"
            v-if="
              profile.data[0].provider_id === user?.user_metadata.provider_id
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
        <div class="bg-base-200 w-full h-fit p-4 rounded-t-md">
          <div class="flex flex-row gap-4 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-lg">
              <img
                v-if="profile.data[0].avatar_url !== null"
                :src="profile.data[0].avatar_url"
                alt="Server Image"
                class="object-cover w-full h-full"
              />
              <div
                v-else
                class="h-full flex flex-col items-center rounded-full bg-base-100"
              >
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{
                    profile.data[0].global_name.slice(0, 1).toUpperCase() || "?"
                  }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-2xl">
                <i
                  class="fa-solid fa-crown text-accent"
                  v-if="profile.data[0].premium_since !== null ? true : false"
                ></i>
                {{ profile.data[0].global_name }}
              </p>
              <p class="opacity-50">@{{ profile.data[0].full_name }}</p>
            </div>
          </div>
        </div>
        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col"
        >
          <div class="pb-4">
            <p class="text-2xl pb-2">Description</p>

            <p class="opacity-50">
              {{ profile.data[0].description || "No description provided" }}
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
import { type Database } from "~/database.types";
import useClipboard from "~/composables/useClipboard";
const route = useRoute();
const router = useRouter();
const user = useSupabaseUser();
const client = useSupabaseClient<Database>();
const user_id = route.params.id;
const syncing = ref<boolean>(false);

const { data: profile } = await useAsyncData(
  "profile",
  async () =>
    await client.from("profiles").select("*").eq("provider_id", user_id)
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
    router.push("/login");
  }
  refreshNuxtData("profile");
  syncing.value = false;
};
</script>
