<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <div class="w-full text-center mt-12" v-if="profile_pending">
      <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
    </div>
    <p class="text-4xl" v-else-if="!profile?.result?.length">
      Hm... That profile doesn't seem to exist!
    </p>
    <template v-else>
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
                v-if="
                  profile?.result?.length &&
                  profile.result[0].premium_since !== null
                    ? true
                    : false
                "
              ></i>
              {{ user?.user_metadata.full_name || "Unknown" }}!
            </h2>
            <p class="text-gray-500">
              Last login: {{ formatDateString(user?.last_sign_in_at || "") }}
            </p>
          </div>
        </div>
      </div>
      <h2 class="text-lg font-semibold mb-4">Dashboard</h2>
      <div class="divider"></div>
      <div class="flex flex-row max-md:flex-col gap-2 w-full">
        <div
          @click="navigateTo('/profiles/' + user?.user_metadata.provider_id)"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Database } from "~/database.types";
const user = useSupabaseUser();
const client = useSupabaseClient<Database>();

const {
  data: profile,
  refresh: refreshProfile,
  pending: profile_pending,
} = useFetch(
  `/api/v1/profiles/fetch/${user.value?.user_metadata.provider_id}`,
  { retry: false }
);

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
