<script setup lang="ts">
import { ref } from 'vue'
import { Viewport, type ImageSelectOptions } from '../../lib'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const selectOptions: ImageSelectOptions = {
  maxFileSize: 10 * 1024 * 1024,
  compress: true,
  quality: 0.5,
}
</script>

<template>
  <Viewport ref="viewportRef" grid />
  <button @click="viewportRef?.select(selectOptions)">选择图片</button>
</template>
