<template>
  <div class="container max-w-4xl mx-auto px-4 py-8 text-center">
    <div class="w-full text-center my-16" v-if="server_pending">
      <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
    </div>
    <p class="text-4xl" v-else-if="!server?.result">
      Hm... That server doesn't seem to exist!
    </p>
    <template v-else>
      <p class="text-4xl">Reporting server "{{ server.result.name }}"</p>
      <div class="flex flex-col py-4">
        <div
          class="bg-base-200 h-fit text-start p-4 rounded-md flex flex-col gap-4"
        >
          <div>
            <p class="text-2xl pb-2">
              Issue Type<span class="text-error">*</span>
            </p>

            <select
              v-model="issue_type"
              class="select select-bordered rounded-none w-full"
            >
              <option disabled selected value="">Select issue</option>
              <option :value="IssueType.Server">The Discord Server</option>
              <option :value="IssueType.Listing">The Listing</option>
            </select>
          </div>
          <div>
            <p class="text-2xl pb-2">
              Description<span class="text-error">*</span>
            </p>

            <textarea
              type="text"
              placeholder="Describe what's wrong..."
              v-model="description"
              class="textarea textarea-bordered rounded-none w-full"
            ></textarea>
          </div>
          <button
            @click="report"
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
import type { Server } from "~/types/Server";

definePageMeta({
  middleware: ["1-protected"],
});
const user = useUser();
const route = useRoute();
const server_discord_id = route.params.id;

enum IssueType {
  Server,
  Listing,
}
const issue_type = ref<string>("");
const description = ref<string>("");

const {
  data: server,
  refresh: refreshServer,
  pending: server_pending,
} = useFetch<{ message: string | null; result: Server | null }>(
  `/api/v1/servers/fetch/${server_discord_id}`,
  { retry: false }
);

const report = async () => {
  const response = await fetch(`/api/v1/servers/report/${server_discord_id}`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      issue_type: issue_type.value,
      description: description.value,
    }),
  });
  if (response.status === 401) {
    await $fetch("/api/v1/auth/logout", {
      method: "POST",
      retry: false,
    });
    user.value = null;
    navigateTo("/login");
  }

  const json = await response.json();
  if (response.status !== 200) return alert(json.message);
  else navigateTo("/thank-you-safety");
};
</script>
