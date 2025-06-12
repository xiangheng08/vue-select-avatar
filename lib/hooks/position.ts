import { watch, watchEffect } from 'vue'
import type { HookOptions } from './types'
import type { ImageSelectResult } from '../types'

export const useInitPosition = (options: HookOptions) => {
  const { props, pos, info, minImageScale, step, ctrlStep, shiftStep, elEmitter } = options

  let first = true

  watch(
    () => props,
    () => {
      pos.viewportWidth = props.width ?? props.size ?? 0
      pos.viewportHeight = props.height ?? props.size ?? 0

      if (!props.fixedImage || first) {
        pos.viewSize = props.viewSize ?? 0
        pos.viewX = (pos.viewportWidth - pos.viewSize) / 2
        pos.viewY = (pos.viewportHeight - pos.viewSize) / 2
      }

      first = false
    },
    { deep: true, immediate: true },
  )

  watch(
    () => props.fixedImage,
    () => {
      if (info.value) {
        initPosition(info.value)
      }
    },
  )

  const initPosition = (res: ImageSelectResult) => {
    info.value = res
    info.value.url = URL.createObjectURL(res.file)

    elEmitter.dispatchEvent(new CustomEvent('broadcast:info', { detail: { ...info.value } }))

    pos.imageWidth = res.width
    pos.imageHeight = res.height

    if (props.fixedImage) {
      pos.imageScale =
        Math.abs(res.width - pos.viewportWidth) > Math.abs(res.height - pos.viewportHeight)
          ? (pos.viewportWidth - props.imagePadding! * 2) / res.width
          : (pos.viewportHeight - props.imagePadding! * 2) / res.height
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
      pos.viewSize = Math.min(pos.imageWidth, pos.imageHeight) * pos.imageScale
      pos.viewX = (pos.viewportWidth - pos.viewSize) / 2
      pos.viewY = (pos.viewportHeight - pos.viewSize) / 2
    } else {
      pos.imageScale = Math.max(pos.viewSize / res.width, pos.viewSize / res.height)
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
      minImageScale.value = pos.imageScale
      step.value = minImageScale.value * (props.scaleStep! / pos.viewSize)
      ctrlStep.value = minImageScale.value * (props.ctrlScaleStep! / pos.viewSize)
      shiftStep.value = minImageScale.value * (props.shiftScaleStep! / pos.viewSize)
    }
  }

  watchEffect(() =>
    elEmitter.dispatchEvent(new CustomEvent('broadcast:pos', { detail: { ...pos } })),
  )

  return { initPosition }
}
