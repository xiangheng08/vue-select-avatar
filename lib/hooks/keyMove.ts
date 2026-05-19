import { onUnmounted, watch } from 'vue'
import type { HookContext } from '../types'

export const useKeyMove = (context: HookContext) => {
  const { props, pos, info } = context

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.mode === 'fixed-image') {
      if (props.arrow) {
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
      if (props.wasd) {
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
      context.checkViewPosition()
    } else {
      if (!info.value) return
      if (props.arrow) {
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
      if (props.wasd) {
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
      context.checkImageBack()
    }
  }

  let last: boolean | undefined

  watch(
    [() => props.wasd, () => props.arrow],
    () => {
      const bool = props.wasd || props.arrow
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
