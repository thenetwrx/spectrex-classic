<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <div class="flex flex-row items-center">
          <h2 class="text-lg font-semibold">Manage Server</h2>

          <div class="flex flex-row gap-1 ml-auto">
            <NuxtLink class="btn btn-ghost btn-sm" href="/dashboard">
              Nevermind
              <i class="fa-solid fa-arrow-left"></i>
            </NuxtLink>
          </div>
        </div>

        <ResourcePending v-if="server_pending" />
        <ResourceNotFound
          v-else-if="!server?.result"
          :message="server_error?.data.message"
        />
        <ResourceNotFound
          v-else-if="server.result.owner_id !== lucia?.user?.id"
          message="Unauthorized"
        />
        <div class="flex flex-col gap-2" v-else>
          <p class="opacity-75 pb-6">
            Submitting a Discord server to Spectrex means you agree to the
            <NuxtLink
              href="/legal/guidelines"
              class="text-accent hover:underline"
              >Guidelines</NuxtLink
            >.
          </p>

          <DashboardCardContainer>
            <DashboardCardHeader title="Language" :required="true" />
            <DashboardCardContent>
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
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader title="Category" :required="true" />
            <DashboardCardContent>
              <select
                v-model="category"
                class="select select-bordered rounded-none w-full"
              >
                <option disabled selected value="">Select category</option>
                <option value="Community">Community</option>
                <option value="Music">Music</option>
                <option value="Gaming">Gaming</option>
                <option value="Anime">Anime</option>
                <option value="Technology">Technology</option>
                <option value="Movies">Movies</option>
                <option value="Other">Other</option>
              </select>
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader title="Tags" />
            <DashboardCardContent>
              <div
                class="flex flex-wrap gap-2 w-fit max-sm:max-w-fit overflow-x-auto mb-2"
                v-if="tags.length"
              >
                <span
                  v-for="(tag, index) in tags"
                  :key="index"
                  class="block max-w-fit px-2 py-1 bg-accent border-none bg-opacity-50 rounded-sm gap-2 hover:bg-opacity-65 hover:cursor-pointer transition-colors duration-200 ease-in-out text-white"
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
                placeholder="Press enter or comma to create tag"
                class="input input-bordered rounded-none w-full"
                v-on:keydown="checkForComma($event)"
                v-model="new_tag"
              />
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader title="Description" :required="true" />
            <DashboardCardContent>
              <textarea
                type="text"
                placeholder="A very interesting server..."
                v-model="description"
                class="textarea textarea-bordered rounded-none h-40 max-h-[42rem] w-full"
              ></textarea>
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader
              title="Invite Link"
              :required="true"
              messsage="(make sure it's a permanent invite!)"
            />
            <DashboardCardContent>
              <input
                type="text"
                placeholder="https://discord.gg/fortnite"
                v-model="invite_link"
                class="input input-bordered rounded-none w-full"
              />
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader title="Primarily NSFW" :required="true" />
            <DashboardCardContent>
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
            </DashboardCardContent>
          </DashboardCardContainer>

          <button
            v-on:click="submit"
            class="btn btn-primary btn-sm my-6 ml-auto"
          >
            Submit
          </button>
        </div>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
  <dialog class="modal" id="modal">
    <div class="modal-box bg-base-200 flex flex-col gap-4">
      <div class="flex flex-row gap-1 items-center w-full">
        <h3 class="text-lg font-bold">Server added!</h3>
      </div>
      <p class="opacity-75">
        Do you want to add the Spectrex Discord bot for a bump command in your
        Discord server? It's 100% optional!
      </p>
      <div class="flex flex-row gap-2 ml-auto">
        <button
          class="btn btn-sm btn-accent"
          v-on:click="
            () => {
              invite_bot(server?.result?.provider_id || '0');
              navigateTo('/dashboard/servers/' + server?.result?.id);
            }
          "
        >
          Accept <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
        </button>
        <NuxtLink
          class="btn btn-sm btn-secondary"
          :href="'/dashboard/servers/' + server?.result?.id"
        >
          Decline
        </NuxtLink>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const discord = useDiscord();
  const route = useRoute();
  const server_id = route.params.id;

  const language = ref<string>("");
  const category = ref<string>("");
  const description = ref<string>("");
  const invite_link = ref<string>("");
  const nsfw = ref<boolean>();
  const tags = ref<Array<string>>([]);
  const new_tag = ref<string>("");

  const {
    data: server,
    pending: server_pending,
    error: server_error,
  } = useFetch<{
    message: string | null;
    result: typeof servers_table.$inferSelect | null;
  }>(`/api/v1/servers/${server_id}`, { retry: false });

  useHead({
    title: computed(() =>
      server.value?.result
        ? `Dashboard - Add ${server.value.result.name}`
        : "Dashboard - Add unknown server"
    ),
  });

  const submit = async () => {
    const response = await fetch(`/api/v1/servers/${server_id}`, {
      method: "PUT",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        language: language.value,
        category: category.value,
        tags: tags.value,
        description: description.value,
        invite_link: invite_link.value,
        nsfw: nsfw.value,
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

    if (response.ok) {
      if (process.client) {
        const element = document.getElementById("modal") as any;
        element.showModal();
      }
    } else {
      const json = await response.json();
      alert(json.message);
    }
  };

  const invite_bot = (server_id: string) => {
    window.open(
      discord.invite.bot_to_server(server_id),
      "name",
      `width=458,height=820,left=${screen.width / 2 - 458 / 2},top=${
        screen.height / 2 - 820 / 2
      }`
    );
  };

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
  const checkForComma = (event: KeyboardEvent) => {
    if (event.key === "," || event.code === "Comma" || event.code === "Enter") {
      event.preventDefault(); // Prevent comma from being entered
      addTag(); // If a comma is entered, add the tag
    }
  };

  // Method to remove a tag from the array
  const removeTag = (index: number) => {
    tags.value.splice(index, 1);
  };
</script>
