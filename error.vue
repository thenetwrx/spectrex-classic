<script setup lang="ts">
  import type { NuxtError } from "#app";
  import status from "statuses";

  const props = defineProps({
    error: Object as () => NuxtError,
  });

  const getErrorMessage = () => {
    const statusCode = props.error?.statusCode;
    return statusCode ? `${statusCode} - ${status(statusCode)}` : "";
  };

  useHead({
    link: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo&family=Share+Tech+Mono&display=swap",
      },
    ],
    title: () => {
      return getErrorMessage();
    },
  });

  const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <Container class="text-center gap-2">
    <h1 class="text-5xl opacity-75">
      {{ getErrorMessage() }}
    </h1>
    <p class="opacity-75 mx-auto max-w-xl">
      Sorry, it seems something went wrong. We're actively investigating this,
      but in the meantime, please go back to the homepage using the button
      below.
    </p>
    <button
      @click="handleError"
      class="btn btn-primary btn-sm rounded-badge mt-12"
    >
      Go back Home
    </button>
  </Container>
</template>
