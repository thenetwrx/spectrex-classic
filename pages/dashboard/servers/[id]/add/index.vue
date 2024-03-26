<template>
  <div class="container max-w-4xl mx-auto px-4 py-8 text-center">
    <p class="text-4xl" v-if="!server?.data?.length">
      Hm... That server doesn't seem to exist!
    </p>
    <template v-else>
      <p class="text-4xl">Add new server</p>
      <div class="flex flex-col py-4">
        <div class="bg-base-200 w-full h-fit p-4 rounded-t-md">
          <div class="flex flex-row gap-4 items-center">
            <div class="w-16 h-16 overflow-hidden rounded-full">
              <img
                v-if="server.data[0].icon"
                :src="
                  'https://cdn.discordapp.com/icons/' +
                  server.data[0].server_id +
                  '/' +
                  server.data[0].icon +
                  '.webp?size=96'
                "
                alt="Server Image"
                class="object-cover w-full h-full"
                :class="server.data[0].nsfw ? 'blur-sm' : ''"
              />
              <div
                v-else
                class="h-full flex flex-col items-center rounded-full bg-base-100"
              >
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{
                    server.data[0].server_name.slice(0, 1).toUpperCase() || "?"
                  }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start">
              <span class="font-medium text-lg">{{
                server.data[0].server_name
              }}</span>
              <div class="flex flex-row gap-1 items-center">
                <div class="bg-[#23A55A] h-4 w-4 rounded-full"></div>
                <p class="opacity-50">
                  {{ server.data[0].approximate_presence_count }} online
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="bg-base-300 h-fit text-start p-4 rounded-b-md flex flex-col gap-4"
        >
          <div>
            <p class="text-2xl pb-2">
              Language<span class="text-error">*</span>
            </p>

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
          <div>
            <p class="text-2xl pb-2">
              Category<span class="text-error">*</span>
            </p>

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
          <div>
            <p class="text-2xl pb-2">Tags</p>

            <!-- Display added tags -->
            <div
              class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto mb-2"
              v-if="tags.length"
            >
              <span
                v-for="(tag, index) in tags"
                :key="index"
                class="block max-w-fit px-2 py-1 bg-primary border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
                @click="removeTag(index)"
              >
                <i class="fa-solid fa-square-xmark fa-lg mr-2"></i>
                <span class="text-primary">#</span>
                {{ tag }}
              </span>
            </div>

            <!-- Input field to add new tags -->
            <input
              type="text"
              placeholder="Separate with enter or comma"
              class="input input-bordered rounded-none w-full"
              @keydown="checkForComma($event)"
              v-model="newTag"
            />
          </div>
          <div>
            <p class="text-2xl pb-2">
              Description<span class="text-error">*</span>
            </p>

            <textarea
              type="text"
              placeholder="A very interesting server..."
              v-model="description"
              class="textarea textarea-bordered rounded-none w-full"
            ></textarea>
          </div>
          <div>
            <p class="text-2xl pb-2">
              Invite Link<span class="text-error">*</span>
              <a class="text-sm opacity-75 ml-2"
                >(make sure it's a permanent invite!)</a
              >
            </p>

            <input
              type="text"
              placeholder="https://discord.gg/fortnite"
              v-model="invite_link"
              class="input input-bordered rounded-none w-full"
            />
          </div>

          <div>
            <p class="text-2xl pb-2">
              Primarily NSFW<span class="text-error">*</span>
            </p>

            <div class="flex flex-col">
              <div class="form-control items-start">
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-nsfw"
                    class="radio"
                    v-model="nsfw"
                    value="true"
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
                    value="false"
                  />
                  <span class="label-text">No</span>
                </label>
              </div>
            </div>
          </div>
          <button
            @click="apply"
            class="btn btn-primary ml-auto mr-auto md:min-w-48 max-md:w-full"
          >
            <i class="fa-solid fa-inbox-out"></i> Submit
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Database } from "~/database.types";
const route = useRoute();
const user = useSupabaseUser();
const client = useSupabaseClient<Database>();
const server_id = route.params.id;

const language = ref<string>("");
const category = ref<string>("");
const description = ref<string>("");
const invite_link = ref<string>("");
const nsfw = ref<boolean | null>(null);

const apply = async () => {
  const response = await fetch(`/api/v1/servers/add/${server_id}`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      language: language.value,
      category: category.value,
      invite_link: invite_link.value,
      tags: tags.value,
      nsfw: nsfw.value,
      description: description.value,
    }),
  });
  if (response.status === 401) {
    await client.auth.signOut();
    navigateTo("/login");
  }

  const json = await response.json();
  if (response.status !== 200) return alert(json.message);
  else navigateTo("/servers/" + server_id);
};

const { data: server } = await useAsyncData(
  "servers",
  async () =>
    await client
      .from("servers")
      .select("*")
      .eq("owner_provider_id", user.value?.user_metadata.provider_id || 0)
      .eq("server_id", server_id)
);

// Define a ref to store tags
const tags = ref<Array<string>>([]);
// Define a ref to store the current input value
const newTag = ref<string>("");

// Method to add a tag to the array
const addTag = () => {
  if (newTag.value.trim() !== "") {
    if (tags.value.length >= 5)
      return alert("You already have too many tags (max of 5)");

    if (newTag.value.trim().length > 16)
      return alert("Tag has too many characters (max of 16)");
    tags.value.push(newTag.value.trim().toLowerCase());
    newTag.value = ""; // Clear the input field after adding tag
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
