<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <img
          :src="
            discordCdn.user_avatar(user?.discord_id || '', user?.avatar || '')
          "
          alt="User Avatar"
          class="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2
            class="text-lg"
            :class="user?.premium_since !== null ? 'text-accent' : ''"
          >
            <i
              class="fa-solid fa-crown"
              v-if="user?.premium_since !== null ? true : false"
            ></i>
            {{ user?.global_name || user?.username || "Unknown" }}
          </h2>
          <p class="text-gray-500">@{{ user?.username || "unknown" }}</p>
        </div>
      </div>
    </div>
    <h2 class="text-lg font-semibold">Dashboard</h2>
    <div class="divider"></div>
    <div class="flex flex-row max-md:flex-col gap-2 w-full">
      <div
        @click="navigateTo('/profiles/' + user?.discord_id)"
        class="bg-base-200 max-md:w-full md:w-1/2 h-20 rounded-md flex flex-row gap-3 p-4 hover:bg-base-300 transition-colors duration-200 cursor-pointer"
      >
        <div class="p-4 rounded-lg w-full flex flex-row gap-4 items-center">
          <i class="fa-solid fa-address-card fa-2xl"></i>
          <p class="text-2xl">Profile</p>
        </div>
        <div class="p-2 mb-auto mt-auto ml-auto">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </div>
      </div>
      <div
        @click="navigateTo('/dashboard/servers')"
        class="bg-base-200 max-md:w-full md:w-1/2 h-20 rounded-md flex flex-row gap-3 p-4 hover:bg-base-300 transition-colors duration-200 cursor-pointer"
      >
        <div class="p-4 rounded-lg w-full flex flex-row gap-4 items-center">
          <i class="fa-solid fa-server fa-2xl"></i>
          <p class="text-2xl">Servers</p>
        </div>
        <div class="p-2 mb-auto mt-auto ml-auto">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["1-protected"],
});
const user = useUser();
const discordCdn = useDiscordCdn();

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
