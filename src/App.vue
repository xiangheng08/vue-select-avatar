<script setup lang="ts">
const query = window.matchMedia('(prefers-color-scheme: dark)')
if (query.matches) {
  document.documentElement.classList.add('dark')
}
</script>

<template>
  <RouterView />
</template>
