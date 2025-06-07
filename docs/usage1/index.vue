<script setup lang="ts">
import { isCancelError, getErrorMessage } from 'vue-select-avatar'

import { ElMessage } from 'element-plus'
import { selectAvatar } from './index'
import { ref } from 'vue'

const src = ref('')
const fileSize = ref(0)
const size = ref(0)

const handleSelect = async () => {
  try {
    const file = await selectAvatar()
    if (src.value) {
      URL.revokeObjectURL(src.value)
    }
    src.value = URL.createObjectURL(file)
    fileSize.value = file.size
  } catch (error) {
    // 错误处理
    if (isCancelError(error)) return
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
  <button @click="handleSelect">选择头像</button>
  <template v-if="src">
    <div style="font-size: 13px">{{ `${size}x${size} ${formatBytes(fileSize)}` }}</div>
    <img :src="src" @load="handleLoad" />
    <button @click="handleClear">清除</button>
  </template>
</template>
