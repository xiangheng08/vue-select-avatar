<script setup lang="ts">
import { ref } from 'vue'
import { formatBytes } from './utils/common'
import { loadImage, Viewport, type ImageSelectOptions } from '../../lib'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const selectOptions: ImageSelectOptions = {
  maxFileSize: 10 * 1024 * 1024,
  compress: true,
  quality: 0.5,
}

const src = ref('')
const imageInfoText = ref('')

const handleCropper = async () => {
  if (src.value) {
    URL.revokeObjectURL(src.value)
  }

  const file = await viewportRef.value?.cropper({ size: 180, type: 'image/webp' })

  if (file instanceof File) {
    const size = formatBytes(file.size)
    console.log(file, size)
    src.value = URL.createObjectURL(file)
    const image = await loadImage(src.value)
    imageInfoText.value = `${image.width}x${image.height} ${size}`
  }
}
</script>

<template>
  <Viewport ref="viewportRef" grid fixed-image />
  <button @click="viewportRef?.select(selectOptions)">选择图片</button>
  <button @click="handleCropper">截取</button>
  <div style="display: flex; flex-direction: column; align-items: center">
    <span style="font-size: 12px; margin-bottom: 4px">{{ imageInfoText }}</span>
    <img :src="src" alt="" />
  </div>
</template>
