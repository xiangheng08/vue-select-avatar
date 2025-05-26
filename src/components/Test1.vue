<script setup lang="ts">
import { ref } from 'vue'
import { Viewport, type ImageSelectOptions } from '../../lib'
import { formatBytes } from './utils/common'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const selectOptions: ImageSelectOptions = {
  maxFileSize: 10 * 1024 * 1024,
  compress: true,
  quality: 0.5,
}

const src = ref('')

const handleCropper = async () => {
  if (src.value) {
    URL.revokeObjectURL(src.value)
  }

  const file = await viewportRef.value?.cropper({ size: 180, type: 'image/webp' })

  if (file instanceof File) {
    console.log(file, formatBytes(file.size))
    src.value = URL.createObjectURL(file)
  }
}
</script>

<template>
  <Viewport ref="viewportRef" grid />
  <button @click="viewportRef?.select(selectOptions)">选择图片</button>
  <button @click="handleCropper">截取</button>
  <img :src="src" alt="" />
</template>
