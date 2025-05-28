<script setup lang="ts">
import Test1 from './components/Test1.vue'
const query = window.matchMedia('(prefers-color-scheme: dark)')
if (query.matches) {
  document.documentElement.classList.add('dark')
}
</script>

<template>
  <Test1 />
</template>
