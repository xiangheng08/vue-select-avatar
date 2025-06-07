<script setup lang="ts">
import 'vue-select-avatar/style.css' // 引入样式
import {
  Viewport,
  getErrorMessage,
  isCancelError,
  selectImage,
  type ImageInfo,
} from 'vue-select-avatar' // 引入组件/函数等

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const info = ref<ImageInfo>()
const src = ref('')
const fileSize = ref(0)
const size = ref(0)

const handleSelect = async () => {
  const res = await selectImage({ maxFileSize: 20 * 1024 * 1024 }).catch((err) => {
    if (isCancelError(err)) return
    // 错误处理
    console.error(err)
    ElMessage.error(getErrorMessage(err))
  })
  if (res) {
    info.value = res
  }
}

const handleCropper = async () => {
  try {
    const file = await viewportRef.value?.cropper<File>()
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
    ElMessage.error(getErrorMessage(error))
  }
}

const handleClear = () => {
  src.value = ''
}

const handleLoad = (e: Event) => {
  size.value = (e.target as HTMLImageElement).width
}

const handleClearInfo = () => {
  info.value = void 0
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
  <template v-if="info">
    <div style="width: fit-content">
      <div style="display: flex; justify-content: flex-end">
        <button @click="handleCropper">截取</button>
      </div>
      <Viewport ref="viewportRef" grid :info="info" />
    </div>
    <button @click="handleClearInfo">清除图片信息</button>
  </template>
  <button @click="handleSelect" v-else>选择图片</button>
  <template v-if="src">
    <div style="font-size: 13px">{{ `${size}x${size} ${formatBytes(fileSize)}` }}</div>
    <img :src="src" @load="handleLoad" />
    <button @click="handleClear">清除</button>
  </template>
</template>
