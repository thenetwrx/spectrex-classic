<template>
  <div class="container max-w-6xl mx-auto pt-32 min-h-screen px-4">
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-row items-center gap-2">
        <div class="w-16 h-16 overflow-hidden rounded-full">
          <div class="avatar" v-if="lucia?.user?.avatar">
            <div class="rounded-full w-full">
              <NuxtImg
                alt="User Image"
                :src="
                  discordCdn.user_avatar(
                    lucia.user.discord_id,
                    lucia.user.avatar
                  )
                "
              />
            </div>
          </div>
          <div class="h-full" v-else>
            <div class="rounded-full w-full h-full bg-secondary flex flex-col">
              <span class="text-xl opacity-50 m-auto">{{
                lucia?.user?.global_name?.slice(0, 2).toUpperCase() || "?"
              }}</span>
            </div>
          </div>
        </div>
        <div>
          <h2 class="text-lg">
            Welcome back,
            <span
              :class="
                lucia?.user?.premium_since !== null ? 'text-[#ffbf28]' : ''
              "
            >
              <i
                class="fa-solid fa-crown"
                v-if="lucia?.user?.premium_since !== null ? true : false"
              ></i>
              {{
                lucia?.user?.global_name || lucia?.user?.username || "Unknown"
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
    <div class="flex flex-row max-md:flex-col gap-2 w-full py-4">
      <div class="flex flex-col gap-1 w-full md:max-w-xs">
        <NuxtLink class="bg-base-200 rounded-md p-2" href="/dashboard">
          Servers
        </NuxtLink>
        <NuxtLink
          class="hover:bg-base-200 rounded-md p-2 opacity-75"
          href="/dashboard/account"
        >
          Account
        </NuxtLink>
      </div>

      <div class="w-full px-2">
        <div class="flex flex-row items-center">
          <h2 class="text-lg font-semibold">Manage Server</h2>

          <div class="flex flex-row gap-1 ml-auto">
            <NuxtLink class="btn btn-ghost btn-sm" href="/dashboard">
              Nevermind
              <i class="fa-solid fa-arrow-left"></i>
            </NuxtLink>
          </div>
        </div>

        <div class="w-full text-center my-16" v-if="server_pending">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <p class="w-full text-center my-16" v-else-if="!server?.result">
          Resource not found
        </p>
        <div class="flex flex-col gap-2" v-else>
          <p class="opacity-75 pb-6">
            Submitting a Discord server to Spectrex means you agree to the
            <NuxtLink href="/guidelines" class="text-accent"
              >Guidelines</NuxtLink
            >.
          </p>

          <div class="flex flex-col">
            <div class="bg-base-200 w-full p-4 flex flex-col rounded-t-md">
              <p class="text-xl">Language<span class="text-error">*</span></p>
            </div>
            <div class="bg-base-300 flex flex-col px-4 py-2 rounded-b-md">
              <select
                v-model="language"
                class="select select-bordered rounded-none w-full"
              >
                <option disabled selected value="">Select language</option>
                <option value="unspecified">Unspecified</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="it">Italiano</option>
                <option value="ja">日本語</option>
                <option value="ru">русский</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col">
            <div class="bg-base-200 w-full p-4 flex flex-col rounded-t-md">
              <p class="text-xl">Category<span class="text-error">*</span></p>
            </div>
            <div class="bg-base-300 flex flex-col px-4 py-2 rounded-b-md">
              <select
                v-model="category"
                class="select select-bordered rounded-none w-full"
              >
                <option disabled selected value="">Select category</option>
                <option value="Community">Community</option>
                <option value="Music">Music</option>
                <option value="Gaming">Gaming</option>
                <option value="Anime">Gaming</option>
                <option value="Technology">Technology</option>
                <option value="Movies">Movies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col">
            <div class="bg-base-200 w-full p-4 flex flex-col rounded-t-md">
              <p class="text-xl">Tags</p>
            </div>
            <div class="bg-base-300 flex flex-col px-4 py-2 rounded-b-md">
              <div
                class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto"
                v-if="tags.length"
              >
                <span
                  v-for="(tag, index) in tags"
                  :key="index"
                  class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white mb-2"
                  v-on:click="removeTag(index)"
                >
                  <i class="fa-solid fa-square-xmark fa-lg mr-2"></i>
                  <span class="text-accent">#</span>
                  {{ tag }}
                </span>
              </div>

              <!-- Input field to add new tags -->
              <input
                type="text"
                placeholder="Separate with enter or comma"
                class="input input-bordered rounded-none w-full"
                v-on:keydown="checkForComma($event)"
                v-model="new_tag"
              />
            </div>
          </div>

          <div class="flex flex-col">
            <div class="bg-base-200 w-full p-4 flex flex-col rounded-t-md">
              <p class="text-xl">
                Description<span class="text-error">*</span>
              </p>
            </div>
            <div class="bg-base-300 flex flex-col px-4 py-2 rounded-b-md">
              <textarea
                type="text"
                placeholder="A very interesting server..."
                v-model="description"
                class="textarea textarea-bordered rounded-none w-full"
              ></textarea>
            </div>
          </div>

          <div class="flex flex-col">
            <div class="bg-base-200 w-full p-4 flex flex-col rounded-t-md">
              <p class="text-xl">
                Invite Link<span class="text-error">* </span>
                <span class="text-sm opacity-75"
                  >(make sure it's a permanent invite!)
                </span>
              </p>
            </div>
            <div class="bg-base-300 flex flex-col px-4 py-2 rounded-b-md">
              <input
                type="text"
                placeholder="https://discord.gg/fortnite"
                v-model="invite_link"
                class="input input-bordered rounded-none w-full"
              />
            </div>
          </div>

          <div class="flex flex-col">
            <div class="bg-base-200 w-full p-4 flex flex-col rounded-t-md">
              <p class="text-xl">
                Primarily NSFW<span class="text-error">*</span>
              </p>
            </div>
            <div class="bg-base-300 flex flex-col px-4 py-2 rounded-b-md">
              <div class="form-control items-start">
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-nsfw"
                    class="radio"
                    v-model="nsfw"
                    :value="true"
                  />
                  <span class="label-text">Yes</span>
                </label>
              </div>
              <div class="form-control items-start">
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-nsfw"
                    class="radio"
                    v-model="nsfw"
                    :value="false"
                  />
                  <span class="label-text">No</span>
                </label>
              </div>
            </div>
          </div>

          <button
            v-on:click="submit"
            class="btn btn-primary btn-sm my-6 ml-auto"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type Server from "~/types/Server";

  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const discordCdn = useDiscordCdn();
  const route = useRoute();
  const server_id = route.params.id;

  const is_public = ref<boolean>();
  const language = ref<string>("");
  const category = ref<string>("");
  const description = ref<string>("");
  const invite_link = ref<string>("");
  const nsfw = ref<boolean>();
  const tags = ref<Array<string>>([]);
  const new_tag = ref<string>("");

  const { data: server, pending: server_pending } = useFetch<{
    message: string | null;
    result: Server | null;
  }>(`/api/v1/servers/${server_id}/fetch`, { retry: false });

  const submit = async () => {
    const response = await fetch(`/api/v1/servers/${server_id}/add`, {
      method: "POST",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        public: is_public.value,
        language: language.value,
        category: category.value,
        tags: tags.value,
        description: description.value,
        nsfw: nsfw.value,
        invite_link: invite_link.value,
      }),
    });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    if (response.ok) navigateTo("/servers/" + server_id);
    else {
      const json = await response.json();
      alert(json.message);
    }
  };

  function formatDateString(dynamicString: string) {
    const date = new Date(Number(dynamicString));

    return date ? date.toString() : "Unknown";
  }

  // Method to add a tag to the array
  const addTag = () => {
    if (new_tag.value.trim() !== "") {
      if (tags.value.length >= 5)
        return alert("You already have too many tags (max of 5)");

      if (new_tag.value.trim().length > 16)
        return alert("Tag has too many characters (max of 16)");
      tags.value.push(new_tag.value.trim().toLowerCase());
      new_tag.value = ""; // Clear the input field after adding tag
    }
  };

  // Method to check for comma key press
  const checkForComma = (event: any) => {
    if (event.key === "," || event.code === "Comma" || event.code === "Enter") {
      event.preventDefault(); // Prevent comma from being entered
      addTag(); // If a comma is entered, add the tag
    }
  };

  // Method to remove a tag from the array
  const removeTag = (index: any) => {
    tags.value.splice(index, 1);
  };
</script>
