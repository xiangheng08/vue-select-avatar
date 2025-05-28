import { watchEffect, reactive, ref, onMounted, onUnmounted, watch } from 'vue'
import type { CSSProperties, Reactive, Ref } from 'vue'
import type {
  ImageInfo,
  ImageSelectResult,
  PointPosition,
  Position,
  SimplePosition,
  ViewportProps,
} from './types'

export interface HookOptions {
  props: ViewportProps
  pos: Reactive<Position>
  info: Ref<ImageInfo | undefined>
  imageMoving: Ref<boolean, boolean>
  viewMoving: Ref<boolean, boolean>
  viewResizing: Ref<boolean, boolean>
  viewportRef: Ref<HTMLElement | undefined>
  minImageScale: Ref<number>
  step: Ref<number>
  ctrlStep: Ref<number>
  shiftStep: Ref<number>
  pressCtrl: Ref<boolean>
  pressShift: Ref<boolean>
  isClipPathSupported: Ref<boolean>
  pointPosition: Ref<PointPosition | undefined>
  backing: Ref<boolean>
}

export const useStyles = (
  options: HookOptions,
): {
  viewportStyle: CSSProperties
  maskStyle: CSSProperties
  viewStyle: CSSProperties
  imageStyle: CSSProperties
  innerImageStyle: CSSProperties
} => {
  const { pos } = options

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

export const useCheckImageBack = (options: HookOptions) => {
  const { props, info, pos, backing } = options

  // 检查图片是否需要回正位置
  const checkImageBack = (transition = true) => {
    if (!info.value || !props.fixedImage) return

    const imageWidth = pos.imageWidth * pos.imageScale
    const imageHeight = pos.imageHeight * pos.imageScale

    // 修正 x 轴边界
    let newX = pos.imageX
    if (newX > pos.viewX) {
      newX = pos.viewX
    } else if (newX < pos.viewX + pos.viewSize - imageWidth) {
      newX = pos.viewX + pos.viewSize - imageWidth
    }

    // 修正 y 轴边界
    let newY = pos.imageY
    if (newY > pos.viewY) {
      newY = pos.viewY
    } else if (newY < pos.viewY + pos.viewSize - imageHeight) {
      newY = pos.viewY + pos.viewSize - imageHeight
    }

    if (newX !== pos.imageX || newY !== pos.imageY) {
      pos.imageX = newX
      pos.imageY = newY
      backing.value = transition
    }
  }

  return { checkImageBack }
}

export const useMouseHandles = (options: HookOptions) => {
  const { imageMoving, viewMoving, viewResizing, info, pos, props, viewportRef, pointPosition } =
    options

  const lastPos = ref<SimplePosition>({ x: 0, y: 0 })

  const { checkImageBack } = useCheckImageBack(options)

  const handleMouseDown = (e: MouseEvent) => {
    if (!info.value || props.fixedImage) return

    e.preventDefault()
    e.stopPropagation()

    lastPos.value.x = e.clientX
    lastPos.value.y = e.clientY
    imageMoving.value = true
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
    imageMoving.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    checkImageBack()
  }

  const handlePointMouseDown = (e: MouseEvent, position: PointPosition) => {
    if (!viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    viewResizing.value = true
    pointPosition.value = position

    const { left, top } = viewportRef.value.getBoundingClientRect()
    lastPos.value.x = e.clientX - left
    lastPos.value.y = e.clientY - top

    document.addEventListener('mousemove', handlePointMouseMove)
    document.addEventListener('mouseup', handlePointMouseUp)
  }

  const handlePointMouseMove = (e: MouseEvent) => {
    if (!viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    const { left, top } = viewportRef.value.getBoundingClientRect()

    const newPos = { x: e.clientX - left, y: e.clientY - top }

    // 等比例缩放
    switch (pointPosition.value) {
      case 'top-left':
        const dx1 = newPos.x - pos.viewX
        const dy1 = newPos.y - pos.viewY
        if (newPos.x >= pos.viewX + dy1 && newPos.x <= pos.viewX + pos.viewSize + dy1 * 2) {
          pos.viewX += dy1
          pos.viewY += dy1
          pos.viewSize -= dy1
        } else {
          pos.viewX += dx1
          pos.viewY += dx1
          pos.viewSize -= dx1
        }
        break
      case 'top-right':
        const dx2 = newPos.x - (pos.viewX + pos.viewSize)
        const dy2 = newPos.y - pos.viewY
        if (newPos.x >= pos.viewX && newPos.x <= pos.viewX + pos.viewSize - dy2) {
          pos.viewY += dy2
          pos.viewSize -= dy2
        } else {
          pos.viewY -= dx2
          pos.viewSize += dx2
        }
        break
      case 'bottom-left':
        const dx3 = newPos.x - pos.viewX
        const dy3 = newPos.y - (pos.viewY + pos.viewSize)
        if (newPos.x >= pos.viewX - dy3 && newPos.x <= pos.viewX - dy3 + (pos.viewSize + dy3)) {
          pos.viewX -= dy3
          pos.viewSize += dy3
        } else {
          pos.viewX += dx3
          pos.viewSize -= dx3
        }
        break
      case 'bottom-right':
        const dx4 = newPos.x - (pos.viewX + pos.viewSize)
        const dy4 = newPos.y - (pos.viewY + pos.viewSize)
        if (newPos.x >= pos.viewX && newPos.x <= pos.viewX + pos.viewSize + dy4) {
          pos.viewSize += dy4
        } else {
          pos.viewSize += dx4
        }
        break
    }

    lastPos.value = newPos
  }

  const handlePointMouseUp = () => {
    viewResizing.value = false
    pointPosition.value = void 0
    document.removeEventListener('mousemove', handlePointMouseMove)
    document.removeEventListener('mouseup', handlePointMouseUp)
  }

  const handleViewMouseDown = (e: MouseEvent) => {
    if (!props.fixedImage || !viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    viewMoving.value = true

    lastPos.value.x = e.clientX
    lastPos.value.y = e.clientY

    document.addEventListener('mousemove', handleViewMouseMove)
    document.addEventListener('mouseup', handleViewMouseUp)
  }

  const handleViewMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    pos.viewX += e.clientX - lastPos.value.x
    pos.viewY += e.clientY - lastPos.value.y

    lastPos.value.x = e.clientX
    lastPos.value.y = e.clientY
  }

  const handleViewMouseUp = () => {
    viewMoving.value = false
    document.removeEventListener('mousemove', handleViewMouseMove)
    document.removeEventListener('mouseup', handleViewMouseUp)
  }

  return { handleMouseDown, handlePointMouseDown, handleViewMouseDown }
}

export const useWheelHandles = (options: HookOptions) => {
  const {
    props,
    imageMoving,
    pos,
    viewportRef,
    info,
    minImageScale,
    pressCtrl,
    pressShift,
    step,
    ctrlStep,
    shiftStep,
  } = options

  const getStep = (deltaY = -1) => {
    let _step = step.value
    if (pressShift.value) {
      _step = shiftStep.value
    } else if (pressCtrl.value) {
      _step = ctrlStep.value
    }
    if (deltaY > 0) {
      _step = -_step
    }
    if (props.wheelReverse) {
      _step = -_step
    }
    return _step
  }

  const { checkImageBack } = useCheckImageBack(options)

  const handleWheel = (e: WheelEvent) => {
    if (!info.value || imageMoving.value) return
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

export const useTouchHandles = (options: HookOptions) => {
  const { info, imageMoving, pos, minImageScale, viewportRef } = options

  const { checkImageBack } = useCheckImageBack(options)

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

    imageMoving.value = true

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!info.value || !imageMoving.value) return

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
    if (!imageMoving.value) return

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
    imageMoving.value = false
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

export const useInitPosition = (options: HookOptions) => {
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
