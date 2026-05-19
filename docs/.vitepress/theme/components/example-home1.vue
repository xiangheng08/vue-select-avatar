<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Viewport, AvatarError } from 'vue-select-avatar'
import { loadCatImage } from '../utils/image'
import { formatBytes } from '../utils/format'
import { ElMessage } from 'element-plus'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const src = ref('')
const fileSize = ref(0)
const size = ref(0)

const load = async () => {
  const res = await loadCatImage()
  viewportRef.value?.positionInit(res)
}

const handleSelect = async () => {
  try {
    await viewportRef.value?.select({
      maxFileSize: 20 * 1024 * 1024,
    })
  } catch (error) {
    if (AvatarError.isCancel(error)) return
    if (error instanceof AvatarError) ElMessage.error(error.message)
  }
}

const handleCropper = async () => {
  const file = await viewportRef.value?.crop()
  if (file instanceof File) {
    if (src.value) {
      URL.revokeObjectURL(src.value)
    }
    src.value = URL.createObjectURL(file)
    fileSize.value = file.size
  }
}

const handleClear = () => {
  src.value = ''
}

const handleLoad = (e: Event) => {
  size.value = (e.target as HTMLImageElement).naturalWidth
}

onMounted(load)
</script>

<template>
  <div style="display: flex; align-items: center; flex-direction: column; gap: 16px">
    <div>
      <div style="display: flex; justify-content: space-between">
        <button @click="handleSelect">选择图片</button>
        <button @click="handleCropper">截取</button>
      </div>
      <Viewport ref="viewportRef" grid />
    </div>
    <template v-if="src">
      <div style="font-size: 13px">{{ `${size}x${size} ${formatBytes(fileSize)}` }}</div>
      <img :src="src" @load="handleLoad" />
      <button @click="handleClear">清除</button>
    </template>
  </div>
</template>
