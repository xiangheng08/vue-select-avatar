import { useCheckImageBack, useCheckViewPosition } from './check'
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { ImageInfo } from '../types'
import type { HookOptions } from './types'

interface BackingOptions {
  imageMoving: Ref<boolean>
}
export const useBacking = (options: BackingOptions) => {
  const { imageMoving } = options

  const backing = ref(false)

  const handleTransitionEnd = () => {
    backing.value = false
  }

  watch(imageMoving, (val) => {
    if (val) {
      // 开始移动时，停止回弹
      backing.value = false
    }
  })

  return { backing, handleTransitionEnd }
}

export const usePressKey = (key: string) => {
  const press = ref(false)
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === key) {
      press.value = true
    }
  }
  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === key) {
      press.value = false
    }
  }
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('keyup', handleKeyup)
  })
  return press
}

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

export const useKeyMove = (options: HookOptions) => {
  const { props, pos, info } = options

  const { checkImageBack } = useCheckImageBack(options)
  const { checkViewPosition } = useCheckViewPosition(options)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.fixedImage) {
      if (props.directionKey) {
        switch (e.key) {
          case 'ArrowUp':
            pos.viewY -= 1
            break
          case 'ArrowRight':
            pos.viewX += 1
            break
          case 'ArrowDown':
            pos.viewY += 1
            break
          case 'ArrowLeft':
            pos.viewX -= 1
            break
        }
      }
      if (props.wasdKey) {
        switch (e.key) {
          case 'w':
            pos.viewY -= 1
            break
          case 'd':
            pos.viewX += 1
            break
          case 's':
            pos.viewY += 1
            break
          case 'a':
            pos.viewX -= 1
            break
        }
      }
      checkViewPosition()
    } else {
      if (!info.value) return
      if (props.directionKey) {
        switch (e.key) {
          case 'ArrowUp':
            pos.imageY -= 1
            break
          case 'ArrowRight':
            pos.imageX += 1
            break
          case 'ArrowDown':
            pos.imageY += 1
            break
          case 'ArrowLeft':
            pos.imageX -= 1
            break
        }
      }
      if (props.wasdKey) {
        switch (e.key) {
          case 'w':
            pos.imageY -= 1
            break
          case 'd':
            pos.imageX += 1
            break
          case 's':
            pos.imageY += 1
            break
          case 'a':
            pos.imageX -= 1
            break
        }
      }
      checkImageBack()
    }
  }

  let last: boolean | undefined

  watch(
    [() => props.wasdKey, () => props.directionKey],
    () => {
      const bool = props.wasdKey || props.directionKey
      if (bool !== last) {
        last = bool
        if (bool) {
          document.addEventListener('keydown', handleKeyDown)
        } else {
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
