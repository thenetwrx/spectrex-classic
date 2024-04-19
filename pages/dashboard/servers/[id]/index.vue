<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <div
          class="flex flex-row sm:items-center w-full max-sm:flex-col-reverse max-sm:gap-2"
        >
          <h2 class="text-lg font-semibold">Manage Server</h2>

          <div class="flex flex-row gap-1 ml-auto">
            <button
              class="btn btn-ghost btn-sm"
              :class="
                !server?.result ||
                server_metadata.bumping ||
                server_metadata.on_cooldown
                  ? 'btn-disabled'
                  : ''
              "
              v-on:click="bump_server"
            >
              <span v-if="server_metadata.on_cooldown">
                {{
                  formatRemainingTime(Number(server?.result?.bumped_at || 0))
                }}
              </span>
              <div v-if="!server_metadata.on_cooldown">
                <span v-if="!server_metadata.bumping">Bump </span>
                <span v-else>Bumping </span>
              </div>
              <i class="fa-solid fa-up-from-line"></i>
            </button>
            <NuxtLink
              class="btn btn-ghost btn-sm"
              :class="!server?.result ? 'btn-disabled' : ''"
              :href="'/servers/' + server?.result?.id"
            >
              View
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </NuxtLink>
            <button
              class="btn btn-ghost btn-sm"
              :class="syncing || !server?.result ? 'btn-disabled' : ''"
              v-on:click="
                async () => {
                  await sync();
                  await refresh_server();
                }
              "
            >
              <span v-if="syncing">Syncing</span>
              <span v-else>Sync</span>
              <span
                v-if="syncing"
                class="loading loading-spinner loading-xs"
              ></span>
              <i v-else class="fa-solid fa-arrows-rotate"></i>
            </button>
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
            {{ server.result.name }} with
            {{ server.result.approximate_member_count }} members
          </p>
          <div
            class="alert bg-accent flex items-start flex-row max-md:flex-col bg-opacity-50 text-opacity-75 rounded-md"
          >
            <span class="max-w-lg">
              <i class="fa-solid fa-circle-info px-2"></i> Want quick and easy
              access to your Spectrex server? Add the Discord bot for a bump
              command!</span
            >
            <NuxtLink
              v-on:click="invite_bot(server.result.provider_id)"
              target="popup"
              class="btn btn-sm btn-secondary ml-auto"
            >
              Add to server
            </NuxtLink>
          </div>
          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">
                Public<span class="text-error">* </span>
                <span class="text-sm opacity-75">
                  (whether or not this server will be publicly listed)
                </span>
              </p>
            </DashboardCardHeader>
            <DashboardCardContent>
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
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">Language<span class="text-error">*</span></p>
            </DashboardCardHeader>
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
            <DashboardCardHeader>
              <p class="text-xl">Category<span class="text-error">*</span></p>
            </DashboardCardHeader>
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
            <DashboardCardHeader>
              <p class="text-xl">Tags</p>
            </DashboardCardHeader>
            <DashboardCardContent>
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
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">
                Description<span class="text-error">*</span>
              </p>
            </DashboardCardHeader>
            <DashboardCardContent>
              <textarea
                type="text"
                placeholder="A very interesting server..."
                v-model="description"
                class="textarea textarea-bordered rounded-none w-full"
              ></textarea>
            </DashboardCardContent>
          </DashboardCardContainer>

          <DashboardCardContainer>
            <DashboardCardHeader>
              <p class="text-xl">
                Invite Link<span class="text-error">* </span>
                <span class="text-sm opacity-75"
                  >(make sure it's a permanent invite!)
                </span>
              </p>
            </DashboardCardHeader>
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
            <DashboardCardHeader>
              <p class="text-xl">
                Primarily NSFW<span class="text-error">*</span>
              </p>
            </DashboardCardHeader>
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

          <DashboardCardContainer>
            <div
              class="bg-error bg-opacity-65 w-full p-4 flex flex-row items-center rounded-md"
            >
              <p class="text-xl">Delete</p>
              <button v-on:click="_delete" class="btn btn-error btn-sm ml-auto">
                Confirm Deletion
              </button>
            </div>
          </DashboardCardContainer>

          <button v-on:click="edit" class="btn btn-primary btn-sm my-6 ml-auto">
            Save Changes
          </button>
        </div>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const discord = useDiscord();
  const route = useRoute();
  const server_id = route.params.id;
  const syncing = ref<boolean>(false);

  const is_public = ref<boolean>();
  const language = ref<string>("");
  const category = ref<string>("");
  const description = ref<string>("");
  const invite_link = ref<string>("");
  const nsfw = ref<boolean>();
  const tags = ref<Array<string>>([]);
  const new_tag = ref<string>("");
  const server_metadata = ref<{
    on_cooldown: boolean;
    bumping: boolean;
  }>({ on_cooldown: false, bumping: false });

  const {
    data: server,
    pending: server_pending,
    refresh: refresh_server,
    error: server_error,
  } = useFetch<{
    message: string | null;
    result: typeof servers_table.$inferSelect | null;
  }>(`/api/v1/servers/${server_id}`, { retry: false });

  useHead({
    title: computed(() =>
      server.value?.result
        ? `Dashboard - ${server.value.result.name}`
        : "Dashboard - unknown server"
    ),
  });

  const refresh_server_metadata = () => {
    const premium = lucia.value?.user.premium_since !== null ? true : false;

    const cooldown = premium ? 3600000 : 7200000;
    const on_cooldown =
      Number(server.value?.result?.bumped_at || 0) + cooldown <= Date.now()
        ? false
        : true;

    server_metadata.value.bumping = false;
    server_metadata.value.on_cooldown = on_cooldown;
  };

  watch(
    server,
    () => {
      if (server.value?.result) {
        refresh_server_metadata();

        is_public.value = server.value.result.public;
        language.value = server.value.result.language!;
        category.value = server.value.result.category!;
        invite_link.value = server.value.result.invite_link!;
        description.value = server.value.result.description!;
        tags.value = server.value.result.tags;
        nsfw.value = server.value.result.nsfw;
      }
    },
    { immediate: true }
  );

  const sync = async () => {
    syncing.value = true;
    const response = await fetch(`/api/v1/servers/${server_id}/sync`, {
      method: "PATCH",
    });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }
    syncing.value = false;
  };

  const edit = async () => {
    const response = await fetch(`/api/v1/servers/${server_id}`, {
      method: "PATCH",
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

    if (response.ok) alert("Changes have been saved");
    else {
      const json = await response.json();
      alert(json.message);
    }
    await refresh_server();
  };

  const _delete = async () => {
    const response = await fetch(`/api/v1/servers/${server_id}`, {
      method: "DELETE",
    });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    if (response.ok) navigateTo("/dashboard");
    else {
      const json = await response.json();
      alert(json.message);
    }
  };

  const invite_bot = (server_id: string) => {
    window.open(
      discord.invite.bot(server_id),
      "name",
      `width=458,height=820,left=${screen.width / 2 - 458 / 2},top=${
        screen.height / 2 - 820 / 2
      }`
    );
  };

  const bump_server = async () => {
    if (server.value !== null) {
      server_metadata.value.bumping = true;
      await sync();
      const response = await fetch(`/api/v1/servers/${server_id}/bump`, {
        method: "POST",
      });
      if (response.status === 401) {
        await $fetch("/api/v1/auth/logout", {
          method: "POST",
          retry: false,
        });
        lucia.value = null;
        navigateTo("/");
      }
      server_metadata.value.bumping = false;
      await refresh_server();
    }
  };

  function formatRemainingTime(bumped_at: number) {
    const premium = lucia.value?.user.premium_since ? true : false;

    const cooldownDuration = premium ? 3600000 : 7200000;
    const targetTime = new Date(bumped_at + cooldownDuration);
    const timeDifference = targetTime.getTime() - Date.now();

    if (timeDifference <= 0) {
      return "00:00:00"; // Cooldown ended
    }

    const totalSeconds = Math.floor(timeDifference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
