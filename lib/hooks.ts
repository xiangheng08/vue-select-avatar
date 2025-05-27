import { watchEffect, reactive, ref, onMounted, onUnmounted, watch } from 'vue'
import type { CSSProperties, Reactive, Ref } from 'vue'
import type { ImageInfo, ImageSelectResult, Position, SimplePosition, ViewportProps } from './types'
import { calculateDistance } from './utils'

export const useStyles = (
  pos: Position,
): {
  viewportStyle: CSSProperties
  maskStyle: CSSProperties
  viewStyle: CSSProperties
  imageStyle: CSSProperties
  innerImageStyle: CSSProperties
} => {
  const viewportStyle = reactive<CSSProperties>({})
  const maskStyle = reactive<CSSProperties>({})
  const viewStyle = reactive<CSSProperties>({})
  const imageStyle = reactive<CSSProperties>({})
  const innerImageStyle = reactive<CSSProperties>({})

  watchEffect(() => {
    viewportStyle.width = `${pos.viewportWidth}px`
    viewportStyle.height = `${pos.viewportHeight}px`
    maskStyle.clipPath = `polygon(0% 0%, 0% 100%, ${pos.viewX}px 100%, ${pos.viewX}px ${pos.viewY}px, ${pos.viewX + pos.viewSize}px ${pos.viewY}px, ${pos.viewX + pos.viewSize}px ${pos.viewY + pos.viewSize}px, ${pos.viewX}px ${pos.viewY + pos.viewSize}px, ${pos.viewX}px 100%, 100% 100%, 100% 0%)`
    viewStyle.width = `${pos.viewSize}px`
    viewStyle.height = `${pos.viewSize}px`
    viewStyle.transform = `translate3d(${pos.viewX}px, ${pos.viewY}px, 0px)`
    imageStyle.width = `${pos.imageWidth}px`
    imageStyle.height = `${pos.imageHeight}px`
    imageStyle.transform = `translate3d(${pos.imageX}px, ${pos.imageY}px, 0px) scale(${pos.imageScale})`
    innerImageStyle.width = `${pos.imageWidth}px`
    innerImageStyle.height = `${pos.imageHeight}px`
    innerImageStyle.transform = `translate3d(${pos.imageX - pos.viewX}px, ${pos.imageY - pos.viewY}px, 0px) scale(${pos.imageScale})`
  })

  return { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle }
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

interface MouseHandlesOptions {
  moving: Ref<boolean>
  checkImageBack: (transition?: boolean) => void
  info: Ref<ImageInfo | undefined>
  pos: Reactive<Position>
  props: Reactive<ViewportProps>
}

type PointPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export const useMouseHandles = (options: MouseHandlesOptions) => {
  const { moving, checkImageBack, info, pos, props } = options

  const lastPos = ref<SimplePosition>({ x: 0, y: 0 })
  let pointPosition: PointPosition | undefined

  const handleMouseDown = (e: MouseEvent) => {
    if (!info.value || props.fixedImage) return

    e.preventDefault()
    e.stopPropagation()

    lastPos.value.x = e.clientX
    lastPos.value.y = e.clientY
    moving.value = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    pos.imageX += e.clientX - lastPos.value.x
    pos.imageY += e.clientY - lastPos.value.y
    lastPos.value.x = e.clientX
    lastPos.value.y = e.clientY
  }

  const handleMouseUp = () => {
    moving.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    checkImageBack()
  }

  const handlePointMouseDown = (e: MouseEvent, position: PointPosition) => {
    e.preventDefault()
    e.stopPropagation()

    pointPosition = position
    lastPos.value.x = e.clientX
    lastPos.value.y = e.clientY
    document.addEventListener('mousemove', handlePointMouseMove)
    document.addEventListener('mouseup', handlePointMouseUp)
  }

  const handlePointMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newPos = { x: e.clientX, y: e.clientY }

    const distance = calculateDistance(lastPos.value, newPos)

    // 等比例缩放
    switch (pointPosition) {
      case 'top-left':
        pos.viewX += distance
        pos.viewY += distance
        pos.viewSize -= distance
        break
    }

    lastPos.value = newPos
  }

  const handlePointMouseUp = () => {
    pointPosition = void 0
    document.removeEventListener('mousemove', handlePointMouseMove)
    document.removeEventListener('mouseup', handlePointMouseUp)
  }

  return { handleMouseDown, handlePointMouseDown }
}

interface WheelHandlesOptions {
  moving: Ref<boolean>
  checkImageBack: (transition?: boolean) => void
  info: Ref<ImageInfo | undefined>
  pos: Reactive<Position>
  viewportRef: Ref<HTMLElement | undefined>
  minImageScale: Ref<number>
  getStep: (deltaY?: number) => number
  props: Reactive<ViewportProps>
}

export const useWheelHandles = (options: WheelHandlesOptions) => {
  const { moving, pos, viewportRef, info, checkImageBack, minImageScale, getStep } = options

  const handleWheel = (e: WheelEvent) => {
    if (!info.value || moving.value) return
    e.preventDefault()
    e.stopPropagation()

    // 获取视口位置和尺寸
    const viewport = viewportRef.value!
    const rect = viewport.getBoundingClientRect()
    const vx = e.clientX - rect.left // 鼠标在视口中的X坐标
    const vy = e.clientY - rect.top // 鼠标在视口中的Y坐标

    const oldScale = pos.imageScale
    const delta = getStep(e.deltaY)
    const newScale = Math.max(minImageScale.value, oldScale + delta) // 避免缩放过小

    // 以鼠标为中心缩放
    pos.imageX = vx - (vx - pos.imageX) * (newScale / oldScale)
    pos.imageY = vy - (vy - pos.imageY) * (newScale / oldScale)

    pos.imageScale = newScale
    checkImageBack(false)
  }

  return { handleWheel }
}

interface TouchHandlesOptions {
  info: Ref<ImageInfo | undefined>
  moving: Ref<boolean>
  pos: Reactive<Position>
  minImageScale: Ref<number>
  viewportRef: Ref<HTMLElement | undefined>
  checkImageBack: (transition?: boolean) => void
  props: Reactive<ViewportProps>
}

export const useTouchHandles = (options: TouchHandlesOptions) => {
  const { info, moving, pos, minImageScale, viewportRef, checkImageBack } = options

  const touchStart = ref<SimplePosition>()
  const touchStartDistance = ref<number>()
  const isTwoFingerZoom = ref(false)
  const touchCenter = ref<SimplePosition>({ x: 0, y: 0 })
  const handleTouchStart = (e: TouchEvent) => {
    if (!info.value) return

    e.preventDefault()
    e.stopPropagation()

    if (e.touches.length === 1) {
      // 单指开始
      const touch = e.touches[0]
      touchStart.value = { x: touch.clientX, y: touch.clientY }
      isTwoFingerZoom.value = false
    } else if (e.touches.length >= 2) {
      // 双指开始
      isTwoFingerZoom.value = true
      touchCenter.value = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
      touchStartDistance.value = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
    }

    moving.value = true

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!info.value || !moving.value) return

    e.preventDefault()
    e.stopPropagation()

    if (e.touches.length === 1 && !isTwoFingerZoom.value) {
      // 单指移动
      const touch = e.touches[0]
      if (touchStart.value) {
        const dx = touch.clientX - touchStart.value.x
        const dy = touch.clientY - touchStart.value.y
        pos.imageX += dx
        pos.imageY += dy
        touchStart.value = { x: touch.clientX, y: touch.clientY }
      }
    } else if (e.touches.length >= 2) {
      // 双指操作：同时缩放和平移
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )

      // 计算当前双指中心点
      const currentCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }

      // 计算中心点偏移量
      const dx = currentCenter.x - touchCenter.value.x
      const dy = currentCenter.y - touchCenter.value.y

      // 更新图片位置
      pos.imageX += dx
      pos.imageY += dy

      // 更新 touchCenter 供下一次计算使用
      touchCenter.value = currentCenter

      // 缩放逻辑
      if (touchStartDistance.value) {
        const scaleRatio = currentDistance / touchStartDistance.value
        const newScale = Math.max(minImageScale.value, pos.imageScale * scaleRatio)

        // 计算视口位置
        const viewport = viewportRef.value!
        const rect = viewport.getBoundingClientRect()
        const vx = touchCenter.value.x - rect.left
        const vy = touchCenter.value.y - rect.top

        // 以双指中心缩放
        pos.imageX = vx - (vx - pos.imageX) * (newScale / pos.imageScale)
        pos.imageY = vy - (vy - pos.imageY) * (newScale / pos.imageScale)
        pos.imageScale = newScale

        // 更新 touchStartDistance 供下一次缩放使用
        touchStartDistance.value = currentDistance
      }
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!moving.value) return

    if (e.touches.length === 1) {
      // 切换到单指拖动
      const touch = e.touches[0]
      touchStart.value = { x: touch.clientX, y: touch.clientY }
      isTwoFingerZoom.value = false
    }
    if (e.touches.length > 0) return
    touchStart.value = void 0
    touchStartDistance.value = void 0
    isTwoFingerZoom.value = false
    moving.value = false
    checkImageBack()
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    document.removeEventListener('touchcancel', handleTouchCancel)
  }

  const handleTouchCancel = (e: TouchEvent) => {
    handleTouchEnd(e)
  }

  return { handleTouchStart }
}

interface BackingOptions {
  moving: Ref<boolean>
}
export const useBacking = (options: BackingOptions) => {
  const { moving } = options

  const backing = ref(false)

  const handleTransitionEnd = () => {
    backing.value = false
  }

  watch(moving, (val) => {
    if (val) {
      // 开始移动时，停止回弹
      backing.value = false
    }
  })

  return { backing, handleTransitionEnd }
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

interface InitPositionOptions {
  props: Reactive<ViewportProps>
  pos: Reactive<Position>
  info: Ref<ImageInfo | undefined>
  minImageScale: Ref<number, number>
  step: Ref<number, number>
  ctrlStep: Ref<number, number>
  shiftStep: Ref<number, number>
}

export const useInitPosition = (options: InitPositionOptions) => {
  const { props, pos, info, minImageScale, step, ctrlStep, shiftStep } = options

  let first = true

  watchEffect(() => {
    pos.viewportWidth = props.size ?? props.width ?? 0
    pos.viewportHeight = props.size ?? props.height ?? 0
    pos.viewSize = props.viewSize ?? 0

    if (!props.fixedImage || first) {
      pos.viewX = (pos.viewportWidth - pos.viewSize) / 2
      pos.viewY = (pos.viewportHeight - pos.viewSize) / 2
    }

    first = false
  })

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

    pos.imageWidth = res.width
    pos.imageHeight = res.height

    if (props.fixedImage) {
      pos.imageScale =
        Math.abs(res.width - pos.viewportWidth) > Math.abs(res.height - pos.viewportHeight)
          ? pos.viewportWidth / res.width
          : pos.viewportHeight / res.height
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
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

  return { initPosition }
}
