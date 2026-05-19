<script setup lang="ts">
import { Viewport } from '../../lib'
</script>

<template>
  <div class="container">
    <Viewport size="full" grid :view="240" mode="fixed-image" />
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 375px;
  height: 800px;
}
</style>
