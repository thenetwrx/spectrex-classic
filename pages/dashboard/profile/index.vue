<template>
  <div class="container max-w-4xl mx-auto px-4 py-8 text-center">
    <div class="w-full text-center mt-12" v-if="profile_pending">
      <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
    </div>
    <p class="text-4xl" v-else-if="!profile?.result?.length">
      Hm... That profile doesn't seem to exist!
    </p>
    <template v-else>
      <p class="text-4xl">Edit profile</p>
      <div class="flex flex-col py-4">
        <div class="bg-base-200 w-full h-fit p-4 rounded-t-md">
          <div class="flex flex-row gap-4 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-lg">
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
              <p class="text-2xl">
                <i
                  class="fa-solid fa-crown text-accent"
                  v-if="profile.result[0].premium_since !== null ? true : false"
                ></i>
                {{ profile.result[0].global_name }}
              </p>
              <p class="opacity-50">@{{ profile.result[0].full_name }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col"
        >
          <div class="pb-4">
            <p class="text-2xl pb-2">Description</p>

            <textarea
              type="text"
              placeholder="A very interesting person..."
              v-model="description"
              class="textarea textarea-bordered rounded-none w-full"
            ></textarea>
          </div>

          <button
            @click="edit"
            class="btn btn-primary ml-auto mr-auto md:min-w-48 max-md:w-full"
          >
            <i class="fa-solid fa-pen-to-square"></i> Save
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Database } from "~/database.types";
const user = useSupabaseUser();
const client = useSupabaseClient<Database>();
const description = ref<string>("");

const edit = async () => {
  const response = await fetch(
    `/api/v1/profiles/edit/${user.value?.user_metadata.provider_id}`,
    {
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        description: description.value,
      }),
    }
  );
  if (response.status === 401) {
    await client.auth.signOut();
    navigateTo("/login");
  }

  const json = await response.json();
  if (response.status !== 200) return alert(json.message);
  else navigateTo("/profiles/" + user.value?.user_metadata.provider_id);
};

const {
  data: profile,
  refresh: refreshProfile,
  pending: profile_pending,
} = useFetch(`/api/v1/profiles/fetch/${user.value?.user_metadata.provider_id}`);

watch(profile, () => {
  description.value =
    (profile.value?.result && profile.value.result[0].description) || "";
});
</script>
