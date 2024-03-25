<script setup lang="ts">
const redirectTo = useCookie("sb-redirect-path");
if (redirectTo.value) {
  const path = redirectTo.value;
  redirectTo.value = null;
  navigateTo(path);
} else navigateTo("/");
</script>

<template>
  <div class="w-full text-center mt-12">
    <i class="fa-solid fa-2xl fa-spinner-third fa-spin"></i>
  </div>
</template>
