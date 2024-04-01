<template>
  <div class="container max-w-4xl mx-auto px-4 pt-32 min-h-screen">
    <div class="w-full text-center mt-12" v-if="profile_pending">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <p class="text-4xl" v-else-if="!profile?.result">
      Hm... That profile doesn't seem to exist!
    </p>
    <template v-else>
      <p class="text-4xl">Edit profile</p>
      <div class="flex flex-col py-4">
        <div class="bg-base-200 w-full h-fit p-2 rounded-t-md">
          <div class="flex flex-wrap gap-2 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-full">
              <img
                v-if="profile.result.avatar !== null"
                :src="
                  discordCdn.user_avatar(
                    profile.result.discord_id,
                    profile.result.avatar
                  )
                "
                alt="Server Image"
                class="object-cover w-full h-full"
              />
              <div
                v-else
                class="h-full flex flex-col items-center rounded-full bg-base-100"
              >
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{
                    profile.result.global_name?.slice(0, 1).toUpperCase() || "?"
                  }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start">
              <p class="font-medium text-lg">
                <i
                  class="fa-solid fa-crown text-accent"
                  v-if="profile.result.premium_since !== null ? true : false"
                ></i>
                {{ profile.result.global_name || profile.result.username }}
              </p>

              <p class="opacity-50">@{{ profile.result.username }}</p>
            </div>
          </div>
        </div>

        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col gap-4"
        >
          <div>
            <p class="text-2xl">
              Public<span class="text-error">*</span>
              <span class="text-sm opacity-75">
                (whether or not this server will be publicly listed)
              </span>
            </p>

            <div class="flex flex-col">
              <div class="form-control items-start">
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-is_public"
                    class="radio"
                    v-model="is_public"
                    :value="true"
                  />
                  <span class="label-text">Yes</span>
                </label>
              </div>
              <div class="form-control items-start">
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-is_public"
                    class="radio"
                    v-model="is_public"
                    :value="false"
                  />
                  <span class="label-text">No</span>
                </label>
              </div>
            </div>
          </div>

          <div>
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
import type { User } from "lucia";

const user = useUser();
const discordCdn = useDiscordCdn();

const is_public = ref<boolean>();
const description = ref<string>("");

const edit = async () => {
  const response = await fetch(`/api/v1/users/edit/me`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      public: is_public.value,
      description: description.value,
    }),
  });
  if (response.status === 401) {
    await $fetch("/api/v1/auth/logout", {
      method: "POST",
      retry: false,
    });
    user.value = null;
    await navigateTo("/");
  }

  const json = await response.json();
  if (response.status !== 200) return alert(json.message);
  else navigateTo("/users/" + user.value?.discord_id);
};

const {
  data: profile,
  refresh: refreshProfile,
  pending: profile_pending,
} = useFetch<{ message: string | null; result: User | null }>(
  `/api/v1/users/fetch/${user.value?.discord_id}`,
  {
    retry: false,
  }
);

watch(profile, () => {
  is_public.value = profile.value?.result?.public;
  description.value = profile.value?.result?.description!;
});
</script>
