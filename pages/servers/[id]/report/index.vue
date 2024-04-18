<template>
  <Container class="max-w-4xl text-center">
    <ResourcePending v-if="server_pending" />
    <ResourceNotFound
      v-else-if="!server?.result"
      :message="server_error?.data.message"
    />
    <template v-else>
      <p class="text-4xl">Report Form</p>
      <p class="opacity-75">
        You are reporting the server "{{ server.result.name }}"
      </p>
      <div class="flex flex-col py-4 max-w-xl mx-auto">
        <div
          class="bg-base-200 h-fit text-start p-4 rounded-md flex flex-col gap-4"
        >
          <div>
            <p class="text-2xl pb-2">Type<span class="text-error">*</span></p>

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
          <button v-on:click="report" class="btn btn-primary btn-sm ml-auto">
            Submit
          </button>
        </div>
      </div>
    </template>
  </Container>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: ["1-protected"],
  });
  const lucia = useLucia();
  const route = useRoute();
  const server_id = route.params.id;

  enum IssueType {
    Server,
    Listing,
  }
  const issue_type = ref<string>("");
  const description = ref<string>("");

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
        ? `Report ${server.value.result.name}`
        : "Report unknown server"
    ),
  });

  const report = async () => {
    const response = await fetch(`/api/v1/servers/${server_id}/report`, {
      method: "PUT",
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
      lucia.value = null;
      navigateTo("/");
    }

    if (response.ok) navigateTo("/thank-you-safety");
    else {
      const json = await response.json();
      alert(json.message);
    }
  };
</script>
