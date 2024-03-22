<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <!-- User Profile -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <img
          :src="user?.user_metadata.avatar_url"
          alt="User Avatar"
          class="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2 class="text-lg font-semibold">
            Welcome back,
            <i
              class="fa-solid fa-crown text-accent"
              v-if="is_premium ? true : false"
            ></i>
            {{ user?.user_metadata.full_name || "Unknown" }}!
          </h2>
          <p class="text-gray-500">
            Last login: {{ formatDateString(user?.last_sign_in_at || "") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Server List -->
    <div class="flex flex-row items-center">
      <h2 class="text-lg font-semibold">Your servers</h2>
      <button
        class="btn btn-ghost btn-sm ml-auto"
        :class="syncing ? 'btn-disabled' : ''"
        @click.stop="syncDiscordServers"
      >
        <span v-if="syncing">Syncing...</span>
        <span v-else>Sync</span>
        <i
          class="fa-solid fa-arrows-rotate"
          :class="syncing ? 'fa-spin' : ''"
        ></i>
      </button>
    </div>
    <div class="divider"></div>
    <ul class="grid md:grid-cols-1 lg:grid-cols-2 gap-3">
      <li
        v-for="(server, index) in servers?.data
          ?.filter((server) => server.approved_at !== null)
          .sort((a, b) => a.server_name.localeCompare(b.server_name))
          .sort((a, b) => a.bumped_at - b.bumped_at)"
        :key="index"
        class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
        @click="$router.push('/servers/' + server.server_id)"
      >
        <div class="flex flex-row items-center w-full">
          <!-- Added relative positioning -->
          <!-- Server Image -->
          <div class="flex flex-col w-full">
            <div class="w-16 h-16 overflow-hidden rounded-lg">
              <img
                v-if="server.icon"
                :src="
                  'https://cdn.discordapp.com/icons/' +
                  server.server_id +
                  '/' +
                  server.icon +
                  '.webp?size=96'
                "
                alt="Server Image"
                class="object-cover rounded-full w-full h-full"
              />
              <div
                v-else
                class="h-full flex flex-col items-center rounded-full bg-base-100"
              >
                <p class="text-zinc-500 mt-auto mb-auto text-3xl">
                  {{ server.server_name.slice(0, 1).toUpperCase() || "?" }}
                </p>
              </div>
            </div>
            <span class="font-medium">{{ server.server_name }}</span>
          </div>

          <div>
            <i class="fa-solid fa-arrow-up-right-from-square ml-auto"></i>
          </div>
          <!-- Server Details -->
        </div>
      </li>
      <li
        class="flex flex-row bg-base-200 hover:bg-base-300 rounded-md cursor-pointer transition-colors duration-200 p-4"
        @click="syncDiscordServers"
        onclick="my_modal_1.showModal()"
      >
        <div class="w-full h-full flex justify-center items-center py-10">
          <i class="fa-solid fa-plus fa-2xl"></i>
        </div>
      </li>
    </ul>
  </div>
  <dialog class="modal" id="my_modal_1">
    <div class="modal-box">
      <div class="flex flex-row gap-1 items-center w-full pb-4">
        <h3 class="text-lg font-bold">Add server</h3>
        <button
          class="btn btn-ghost btn-sm ml-auto"
          :class="syncing ? 'btn-disabled' : ''"
          @click.stop="syncDiscordServers"
        >
          <span v-if="syncing">Syncing...</span>
          <span v-else>Sync</span>
          <i
            class="fa-solid fa-arrows-rotate"
            :class="syncing ? 'fa-spin' : ''"
          ></i>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="my_modal_1.close()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <select
        class="select select-bordered rounded-none w-full"
        @change="((event:any) => $router.push(event?.target?.value || '/'))"
      >
        <option disabled selected>Select server</option>
        <option
          v-for="(server, index) in servers?.data
            ?.filter((server) => server.approved_at === null)
            .sort((a, b) => a.server_name.localeCompare(b.server_name))"
          :value="'/dashboard/servers/' + server.server_id + '/add'"
        >
          {{ server.server_name }}
        </option>
      </select>
    </div>
  </dialog>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["check-session"],
});
const router = useRouter();
import { type Database } from "~/database.types";
const user = useSupabaseUser();
const client = useSupabaseClient<Database>();
const is_premium = ref<boolean>(false);
const syncing = ref<boolean>(false);

await useAsyncData("profile", async () => {
  const { data: _profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user?.value?.id || 0);

  if (_profile?.length) {
    if (_profile[0].premium_since !== null) is_premium.value = true;
  }

  return { data: _profile };
});
const { data: servers } = await useAsyncData(
  "servers",
  async () =>
    await client
      .from("servers")
      .select("*")
      .eq("owner_provider_id", user.value?.user_metadata.provider_id || 0)
);

const syncDiscordServers = async () => {
  syncing.value = true;
  const response = await fetch("/api/v1/servers/sync");
  if (response.status === 401) {
    await client.auth.signOut();
    router.push("/login");
  }
  refreshNuxtData("servers");
  syncing.value = false;
};

function formatDateString(dynamicString: string) {
  // Parse the string into a Date object
  const date = new Date(dynamicString);

  // Months array for month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Format the date
  const formattedDate = `${
    months[date.getMonth()]
  } ${date.getDate()} at ${formatAMPM(
    date.getHours(),
    date.getMinutes()
  )}, ${date.getFullYear()}`;

  // Function to format hours in AM/PM format
  function formatAMPM(hours: number, minutes: number) {
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes; // Add leading zero if minutes < 10
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  }

  return formattedDate;
}
</script>
