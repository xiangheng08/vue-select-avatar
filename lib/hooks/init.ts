import { nextTick, onMounted, watch } from 'vue'
import { DEFAULT_VIEWPORT_PROPS } from '../defaults'
import { resolveSize, resolveStep, resolveViewSize } from '../utils'
import type { HookContext, ImageSelectResult } from '../types'

export const useInit = (context: HookContext) => {
  const { props, pos, info, minImageScale, step, ctrlStep, shiftStep, viewportRef } = context

  let firstViewportInit = true
  const viewportInit = () => {
    const { width, height } = resolveSize(props)

    pos.viewportWidth = width === 'full' ? viewportRef.value?.clientWidth || 0 : width!
    pos.viewportHeight = height === 'full' ? viewportRef.value?.clientHeight || 0 : height!

    if (props.mode === 'fixed-view' || firstViewportInit) {
      pos.viewSize = resolveViewSize(props.view, DEFAULT_VIEWPORT_PROPS.view!, pos)
      pos.viewX = (pos.viewportWidth - pos.viewSize) / 2
      pos.viewY = (pos.viewportHeight - pos.viewSize) / 2
    }

    firstViewportInit = false
  }

  const positionInit = (res: ImageSelectResult) => {
    info.value = res
    info.value.url = URL.createObjectURL(res.file)
    context.broadcastInfo()

    pos.imageWidth = res.width
    pos.imageHeight = res.height

    if (props.mode === 'fixed-view') {
      pos.imageScale = Math.max(pos.viewSize / res.width, pos.viewSize / res.height)
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
      minImageScale.value = pos.imageScale
      stepInit()
    } else if (props.mode === 'fixed-image') {
      pos.imageScale =
        Math.abs(res.width - pos.viewportWidth) > Math.abs(res.height - pos.viewportHeight)
          ? (pos.viewportWidth - props.padding! * 2) / res.width
          : (pos.viewportHeight - props.padding! * 2) / res.height
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
      pos.viewSize = Math.min(pos.imageWidth, pos.imageHeight) * pos.imageScale
      pos.viewX = (pos.viewportWidth - pos.viewSize) / 2
      pos.viewY = (pos.viewportHeight - pos.viewSize) / 2
    } else {
      throw new Error(`Invalid mode: ${props.mode}`)
    }
  }

  const stepInit = () => {
    step.value = resolveStep(props.step!, DEFAULT_VIEWPORT_PROPS.step!, minImageScale.value, pos)
    ctrlStep.value = resolveStep(
      props.ctrlStep!,
      DEFAULT_VIEWPORT_PROPS.step!,
      minImageScale.value,
      pos,
    )
    shiftStep.value = resolveStep(
      props.shiftStep!,
      DEFAULT_VIEWPORT_PROPS.step!,
      minImageScale.value,
      pos,
    )
  }

  watch([() => props.size, () => props.width, () => props.height, () => props.view], viewportInit)

  watch(
    [
      () => props.step,
      () => props.ctrlStep,
      () => props.shiftStep,
      () => pos.viewSize,
      minImageScale,
    ],
    stepInit,
  )

  watch(
    () => props.mode,
    () => {
      if (info.value) {
        positionInit(info.value)
      }
    },
  )

  watch(
    () => props.info,
    (val) => {
      if (val) {
        positionInit(val)
      }
    },
  )

  const { width, height } = resolveSize(props)
  const hasFull = width === 'full' || height === 'full'
  if (!hasFull) viewportInit()
  onMounted(async () => {
    await nextTick()
    if (hasFull) viewportInit()
    if (props.info) positionInit(props.info)
  })

  return { positionInit }
}
