<script setup lang="ts">
import 'vue-select-avatar/style.css' // 引入样式
import { Viewport, Preview } from 'vue-select-avatar' // 引入组件/函数等

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const src = ref('')
const fileSize = ref(0)
const size = ref(0)

const handleSelect = () => {
  viewportRef.value?.select().catch((err) => {
    if (err instanceof Error && err.message === 'CANCEL') {
      return
    }
    // 错误处理
    console.error(err)
    ElMessage.error(err.message)
  })
}

const handleCropper = async () => {
  try {
    const file = await viewportRef.value?.cropper()
    if (file instanceof File) {
      if (src.value) {
        URL.revokeObjectURL(src.value)
      }
      src.value = URL.createObjectURL(file)
      fileSize.value = file.size
    }
  } catch (error) {
    // 错误处理
    console.error(error)
    ElMessage.error(error.message)
  }
}

const handleClear = () => {
  src.value = ''
}

const handleLoad = (e: Event) => {
  size.value = (e.target as HTMLImageElement).width
}

// 辅助函数
const formatBytes = (bytes: number, decimals = 2) => {
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + units[i] + 'B'
}
</script>

<template>
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap">
    <div style="width: fit-content">
      <div style="display: flex; justify-content: space-between">
        <button @click="handleSelect">选择图片</button>
        <button @click="handleCropper">截取</button>
      </div>
      <Viewport ref="viewportRef" grid />
    </div>
    <Preview :viewport-ref="viewportRef" bg="#252526" />
  </div>
  <template v-if="src">
    <div style="font-size: 13px">{{ `${size}x${size} ${formatBytes(fileSize)}` }}</div>
    <img :src="src" @load="handleLoad" />
    <button @click="handleClear">清除</button>
  </template>
</template>
