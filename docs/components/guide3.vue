<script setup lang="ts">
import { Viewport, AvatarError, type ViewportInstance } from 'vue-select-avatar' // 引入组件/函数等

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const viewportRef = ref<ViewportInstance>()
const src = ref('')
const fileSize = ref(0)
const size = ref(0)

const handleSelect = () => {
  viewportRef.value?.select({ maxFileSize: 20 * 1024 * 1024 }).catch((err) => {
    // 忽略取消错误
    if (AvatarError.isCancel(err)) return
    // 错误处理
    console.error(err)
    ElMessage.error(err instanceof Error ? err.message : String(err))
  })
}

const handleCrop = async () => {
  try {
    const file = await viewportRef.value?.crop<File>({ format: 'file' })
    if (file) {
      if (src.value) {
        URL.revokeObjectURL(src.value)
      }
      src.value = URL.createObjectURL(file)
      fileSize.value = file.size
    }
  } catch (error) {
    // 错误处理
    console.error(error)
    ElMessage.error(error instanceof Error ? error.message : String(error))
  }
}

const handleClear = () => {
  src.value = ''
}

const handleLoad = (e: Event) => {
  size.value = (e.target as HTMLImageElement).naturalWidth
}

// 辅助函数
const formatBytes = (bytes: number, decimals = 2) => {
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + units[i]! + 'B'
}
</script>

<template>
  <div style="width: fit-content">
    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0 0.2rem">
      <button @click="handleSelect">选择图片</button>
      <button @click="handleCrop">截取</button>
    </div>
    <Viewport ref="viewportRef" grid mode="fixed-image" />
  </div>
  <template v-if="src">
    <div style="font-size: 13px">{{ `${size}x${size} ${formatBytes(fileSize)}` }}</div>
    <img :src="src" @load="handleLoad" />
    <button @click="handleClear">清除</button>
  </template>
</template>
