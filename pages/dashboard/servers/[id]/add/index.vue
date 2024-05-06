<template>
  <Container class="max-w-6xl">
    <DashboardMainHeader />
    <DashboardMainContainer>
      <DashboardMainSidebar active="servers" />
      <DashboardMainContent>
        <DashboardMainContentHeader title="Add Server">
          <DashboardMainContentHeaderButtons>
            <NuxtLink class="btn btn-ghost btn-sm" href="/dashboard">
              Nevermind
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
        <template v-else>
          <p class="opacity-75">
            {{ server.result.name }} with
            {{ server.result.approximate_member_count }} members
          </p>

          <ul class="steps w-full py-6">
            <li class="step" :class="step === 0 ? 'step-primary' : ''">
              Add the Bot
            </li>
            <li class="step" :class="step === 1 ? 'step-primary' : ''">
              Invite Setup
            </li>
            <li class="step" :class="step === 2 ? 'step-primary' : ''">
              Listing
            </li>
          </ul>

          <div class="pt-6 text-center w-full flex flex-col gap-4 h-full">
            <template v-if="step === 0">
              <h2 class="text-2xl">
                You'll need to add the official Discord Bot to continue.
              </h2>

              <button
                v-on:click="
                  () => {
                    invite_bot(server?.result?.provider_id || '0');
                    step = 1;
                  }
                "
                class="btn btn-primary btn-sm rounded-badge w-fit mx-auto"
              >
                Add to server
              </button>
              <p class="opacity-50">already added? press next</p>

              <div class="flex flex-row gap-2 pt-24">
                <button
                  class="btn btn-primary btn-sm ml-auto"
                  v-on:click="go_to_step(1)"
                >
                  Next
                </button>
              </div>
            </template>
            <template v-else-if="step === 1">
              <h2 class="text-2xl">Next, you'll need to run a command.</h2>

              <p class="max-w-md mx-auto">
                Open Discord and go to any channel in your server. Type / and
                look for the
                <code class="bg-secondary p-1 rounded-md">setup</code>
                command from Spectrex.
              </p>

              <div class="flex flex-row gap-2 pt-24">
                <button
                  class="btn btn-secondary btn-sm ml-auto"
                  v-on:click="go_to_step(0)"
                >
                  Back
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  :class="checking ? 'btn-disabled' : ''"
                  v-on:click="check_configuration"
                >
                  {{ checking ? "Checking" : "Next" }}
                  <span
                    class="loading loading-spinner loading-xs"
                    v-if="checking"
                  ></span>
                </button>
              </div>
            </template>
            <template v-else>
              <h2 class="text-2xl">Finally, you'll need to fill out a form.</h2>

              <DashboardMainStack class="mt-8 text-start">
                <DashboardCardContainer>
                  <DashboardCardHeader title="Language" :required="true" />
                  <DashboardCardContent>
                    <select
                      v-model="language"
                      class="select select-bordered rounded-none w-full"
                    >
                      <option disabled selected value="">
                        Select language
                      </option>
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
                      <option disabled selected value="">
                        Select category
                      </option>
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
                      placeholder="Press enter, comma or space to create a tag with given input"
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
                    title="Primarily NSFW"
                    :required="true"
                  />
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

                <div class="flex flex-row gap-2 pt-24">
                  <button
                    class="btn btn-secondary btn-sm ml-auto"
                    v-on:click="go_to_step(1)"
                  >
                    Back
                  </button>
                  <button
                    class="btn btn-primary btn-sm"
                    :class="submitting ? 'btn-disabled' : ''"
                    v-on:click="submit"
                  >
                    {{ submitting ? "Submitting" : "Submit" }}
                    <span
                      class="loading loading-spinner loading-xs"
                      v-if="submitting"
                    ></span>
                  </button>
                </div>
              </DashboardMainStack>
            </template>
          </div>
        </template>
      </DashboardMainContent>
    </DashboardMainContainer>
  </Container>
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

  const step = ref<number>(0);
  const checking = ref<boolean>(false);
  const submitting = ref<boolean>(false);

  const language = ref<string>("");
  const category = ref<string>("");
  const description = ref<string>("");
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

  const go_to_step = async (num: number) => {
    step.value = num;
  };

  const submit = async () => {
    submitting.value = true;
    const response = await fetch(`/api/v1/servers/${server_id}`, {
      method: "PUT",
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({
        language: language.value,
        category: category.value,
        tags: tags.value,
        description: description.value,
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
      useNuxtApp().$toast.success("Server submitted successfully");
      navigateTo("/dashboard/servers/" + server_id);
    } else {
      const json = await response.json();
      useNuxtApp().$toast.error(json.message);
    }
    submitting.value = false;
  };

  const check_configuration = async () => {
    checking.value = true;
    const response = await fetch(`/api/v1/servers/${server_id}/check`, {
      method: "GET",
    });
    if (response.status === 401) {
      await $fetch("/api/v1/auth/logout", {
        method: "POST",
        retry: false,
      });
      lucia.value = null;
      navigateTo("/");
    }

    const json = await response.json();
    console.log(json);
    if (response.ok && json.success) {
      step.value = 2;
    } else {
      useNuxtApp().$toast.error(json.message);
    }
    checking.value = false;
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
          "Tag is too long (max of 16 characters)"
        );

      tags.value = [...tags.value, new_tag.value.trim().toLowerCase()];
      new_tag.value = "";
    }
  };

  const removeTag = (index: number) => {
    tags.value = tags.value.filter((_, i) => i !== index);
  };

  const checkForComma = (event: KeyboardEvent) => {
    if (
      event.key === "," ||
      event.code === "Comma" ||
      event.code === "Enter" ||
      event.code === "Space"
    ) {
      event.preventDefault();
      addTag();
    }
  };
</script>
