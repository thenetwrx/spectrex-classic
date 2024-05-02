<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Add Server">
          <DashboardMainContentHeaderButtons>
            <NuxtLink class="btn btn-ghost btn-sm" href="/dashboard">
              Back
              <i class="fa-solid fa-arrow-left"></i>
            </NuxtLink>
          </DashboardMainContentHeaderButtons>
        </DashboardMainContentHeader>

        <div
          class="alert bg-error flex items-start flex-row max-md:flex-col bg-opacity-50 text-opacity-75 rounded-md mt-6"
          v-if="server?.result?.banned"
        >
          <p>
            <i class="fa-solid fa-triangle-exclamation px-2"></i>
            This server has been banned. Please
            <NuxtLink class="font-bold underline" href="/legal/guidelines"
              >review our guidelines</NuxtLink
            >
            promptly to avoid further infractions!
          </p>
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
        <ResourceNotFound
          v-else-if="server.result.banned"
          message="Unauthorized"
        />
        <template v-else>
          <p class="opacity-75 pb-6">
            {{ server.result.name }} with
            {{ server.result.approximate_member_count }} members
          </p>

          <DashboardMainStack>
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
                  <option
                    v-for="_category in permitted_categories"
                    :value="_category"
                  >
                    {{ _category }}
                  </option>
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
                message="(make sure it's a permanent invite!)"
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
          </DashboardMainStack>
        </template>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
  <dialog class="modal" id="modal">
    <div
      class="modal-box bg-base-200 max-w-2xl border border-secondary flex flex-col gap-4"
    >
      <div class="flex flex-row gap-1 items-center w-full">
        <h3 class="text-lg font-bold">Server submitted!</h3>
      </div>
      <p class="opacity-75">
        Your server has been put up for review and could take up to 24 hours to
        process. We ask for your patientence as we work to keep Spectrex safe!
      </p>
      <p class="opacity-75">
        While you wait, do you want to add the official Spectrex Discord bot for
        a bump command in your Discord server?
      </p>
      <div class="flex flex-row gap-2 ml-auto">
        <button
          class="btn btn-sm btn-accent"
          v-on:click="
            () => {
              invite_bot(server?.result?.provider_id || '0');
              navigateTo('/dashboard');
            }
          "
        >
          Accept <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
        </button>
        <NuxtLink class="btn btn-sm btn-secondary" href="/dashboard">
          Decline
        </NuxtLink>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  import { permitted_categories } from "@/server/utils/permit";

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
      useNuxtApp().$toast.error(json.message);
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

  const addTag = () => {
    if (new_tag.value.trim() !== "") {
      if (tags.value.length >= 5)
        return useNuxtApp().$toast.error(
          "You already have too many tags (max of 5)"
        );

      if (new_tag.value.trim().length > 16)
        return useNuxtApp().$toast.error(
          "Tag has too many characters (max of 16)"
        );

      tags.value = [...tags.value, new_tag.value.trim().toLowerCase()];
      new_tag.value = "";
    }
  };

  const removeTag = (index: number) => {
    tags.value = tags.value.filter((_, i) => i !== index);
  };

  const checkForComma = (event: KeyboardEvent) => {
    if (event.key === "," || event.code === "Comma" || event.code === "Enter") {
      event.preventDefault();
      addTag();
    }
  };
</script>
