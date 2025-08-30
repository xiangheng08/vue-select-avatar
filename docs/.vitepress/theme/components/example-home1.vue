<script setup lang="ts">
import 'vue-select-avatar/style.css'
import { Viewport, isCancelError, getErrorMessage } from 'vue-select-avatar'

import { onMounted, ref } from 'vue'
import { loadCatImage } from '../utils/image'
import { formatBytes } from '../utils/format'
import { ElMessage } from 'element-plus'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const src = ref('')
const fileSize = ref(0)
const size = ref(0)

const load = async () => {
  const res = await loadCatImage()
  viewportRef.value?.initPosition(res)
}

const handleSelect = async () => {
  try {
    await viewportRef.value?.select({
      maxFileSize: 20 * 1024 * 1024,
    })
  } catch (error) {
    if (isCancelError(error)) return
    ElMessage.error(getErrorMessage(error))
  }
}

const handleCropper = async () => {
  const file = await viewportRef.value?.cropper()
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
