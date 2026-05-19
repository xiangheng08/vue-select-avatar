<script setup lang="ts">
import { ref } from 'vue'
import { Viewport, selectImage, AvatarError } from 'vue-select-avatar'
import type { ViewportInstance, ImageInfo } from 'vue-select-avatar'

const viewportRef = ref<ViewportInstance>()
const info = ref<ImageInfo>()

const handleSelect = async () => {
  try {
    info.value = await selectImage({ maxFileSize: 1024 * 1024 * 5 })
  } catch (error) {
    if (AvatarError.isCancel(error)) return
  }
}

const handleCrop = () => {
  viewportRef.value?.crop<File>({ format: 'file' }).then((file) => {
    console.log(file.size, file)
  })
}
</script>

<template>
  <button @click="handleSelect">选择图片</button>
  <button @click="handleCrop">截取图片</button>
  <Viewport v-if="info" ref="viewportRef" grid :info="info" />
</template>
