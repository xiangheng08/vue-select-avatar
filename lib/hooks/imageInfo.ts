import { onUnmounted, ref, watchEffect } from 'vue'
import type { ImageInfo } from '../types'

export const useImageInfo = () => {
  const info = ref<ImageInfo>()
  let lastUrl: string | undefined

  onUnmounted(() => {
    if (info.value?.url) {
      URL.revokeObjectURL(info.value.url)
    }
  })

  watchEffect(() => {
    if (lastUrl && lastUrl !== info.value?.url) {
      URL.revokeObjectURL(lastUrl)
    }
    lastUrl = info.value?.url
  })

  return info
}
