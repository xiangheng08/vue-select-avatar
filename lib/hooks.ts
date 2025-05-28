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
    if (!info.value || props.fixedImage) return

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

export const useCheckViewPosition = (options: HookOptions) => {
  const { pos, info } = options
  const checkViewPosition = () => {
    if (!info.value) return

    if (pos.viewX < pos.imageX) {
      pos.viewX = pos.imageX
    }

    if (pos.viewY < pos.imageY) {
      pos.viewY = pos.imageY
    }

    if (pos.viewX + pos.viewSize > pos.imageX + pos.imageWidth * pos.imageScale) {
      pos.viewX = pos.imageX + pos.imageWidth * pos.imageScale - pos.viewSize
    }

    if (pos.viewY + pos.viewSize > pos.imageY + pos.imageHeight * pos.imageScale) {
      pos.viewY = pos.imageY + pos.imageHeight * pos.imageScale - pos.viewSize
    }
  }

  return { checkViewPosition }
}

export const useResizeView = (options: HookOptions) => {
  const { pos, pointPosition, props, info } = options

  const resizeView = (newPos: SimplePosition) => {
    // 等比例缩放
    switch (pointPosition.value) {
      case 'top-left':
        const dx1 = newPos.x - pos.viewX
        const dy1 = newPos.y - pos.viewY
        let n = dx1
        if (newPos.x >= pos.viewX + dy1 && newPos.x <= pos.viewX + pos.viewSize + dy1) {
          n = dy1
        }
        pos.viewX += n
        pos.viewY += n
        pos.viewSize -= n
        if (pos.viewSize < props.minViewSize!) {
          pos.viewX += pos.viewSize - props.minViewSize!
          pos.viewY += pos.viewSize - props.minViewSize!
          pos.viewSize = props.minViewSize!
        }
        if (info.value && pos.viewX < pos.imageX) {
          pos.viewSize -= pos.imageX - pos.viewX
          pos.viewY += pos.imageX - pos.viewX
          pos.viewX = pos.imageX
        }
        if (info.value && pos.viewY < pos.imageY) {
          pos.viewSize -= pos.imageY - pos.viewY
          pos.viewX += pos.imageY - pos.viewY
          pos.viewY = pos.imageY
        }
        break
      case 'top-right':
        const dx2 = newPos.x - (pos.viewX + pos.viewSize)
        const dy2 = newPos.y - pos.viewY
        if (newPos.x >= pos.viewX && newPos.x <= pos.viewX + pos.viewSize - dy2) {
          pos.viewY += dy2
          pos.viewSize -= dy2
          if (pos.viewSize < props.minViewSize!) {
            pos.viewY += pos.viewSize - props.minViewSize!
            pos.viewSize = props.minViewSize!
          }
        } else {
          pos.viewY -= dx2
          pos.viewSize += dx2
          if (pos.viewSize < props.minViewSize!) {
            pos.viewY += pos.viewSize - props.minViewSize!
            pos.viewSize = props.minViewSize!
          }
        }
        if (info.value && pos.viewY < pos.imageY) {
          pos.viewSize -= pos.imageY - pos.viewY
          pos.viewY = pos.imageY
        }
        if (info.value && pos.viewX + pos.viewSize > pos.imageX + pos.imageWidth * pos.imageScale) {
          pos.viewY -= pos.imageX + pos.imageWidth * pos.imageScale - (pos.viewX + pos.viewSize)
          pos.viewSize = pos.imageX + pos.imageWidth * pos.imageScale - pos.viewX
        }
        break
      case 'bottom-left':
        const dx3 = newPos.x - pos.viewX
        const dy3 = newPos.y - (pos.viewY + pos.viewSize)
        if (newPos.x >= pos.viewX - dy3 && newPos.x <= pos.viewX - dy3 + (pos.viewSize + dy3)) {
          pos.viewX -= dy3
          pos.viewSize += dy3
          if (pos.viewSize < props.minViewSize!) {
            pos.viewX = pos.viewX + pos.viewSize - props.minViewSize!
            pos.viewSize = props.minViewSize!
          }
        } else {
          pos.viewX += dx3
          pos.viewSize -= dx3
          if (pos.viewSize < props.minViewSize!) {
            pos.viewX = pos.viewX + pos.viewSize - props.minViewSize!
            pos.viewSize = props.minViewSize!
          }
        }
        if (info.value && pos.viewX < pos.imageX) {
          pos.viewSize -= pos.imageX - pos.viewX
          pos.viewX = pos.imageX
        }
        if (
          info.value &&
          pos.viewY + pos.viewSize > pos.imageY + pos.imageHeight * pos.imageScale
        ) {
          pos.viewX -= pos.imageY + pos.imageHeight * pos.imageScale - (pos.viewY + pos.viewSize)
          pos.viewSize = pos.imageY + pos.imageHeight * pos.imageScale - pos.viewY
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
        if (pos.viewSize < props.minViewSize!) {
          pos.viewSize = props.minViewSize!
        }
        if (info.value && pos.viewX + pos.viewSize > pos.imageX + pos.imageWidth * pos.imageScale) {
          pos.viewSize = pos.imageX + pos.imageWidth * pos.imageScale - pos.viewX
        }
        if (
          info.value &&
          pos.viewY + pos.viewSize > pos.imageY + pos.imageHeight * pos.imageScale
        ) {
          pos.viewSize = pos.imageY + pos.imageHeight * pos.imageScale - pos.viewY
        }
        break
    }
  }

  return { resizeView }
}

export const useMouseHandles = (options: HookOptions) => {
  const { imageMoving, viewMoving, viewResizing, info, pos, props, viewportRef, pointPosition } =
    options

  const lastPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startViewPos = ref<SimplePosition>({ x: 0, y: 0 })
  const viewportPos = ref<SimplePosition>({ x: 0, y: 0 })

  const { checkImageBack } = useCheckImageBack(options)
  const { resizeView } = useResizeView(options)
  const { checkViewPosition } = useCheckViewPosition(options)

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
    viewportPos.value.x = left
    viewportPos.value.y = top
    lastPos.value.x = e.clientX - left
    lastPos.value.y = e.clientY - top

    document.addEventListener('mousemove', handlePointMouseMove)
    document.addEventListener('mouseup', handlePointMouseUp)
  }

  const handlePointMouseMove = (e: MouseEvent) => {
    if (!viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    const newPos = { x: e.clientX - viewportPos.value.x, y: e.clientY - viewportPos.value.y }

    resizeView(newPos)

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

    startPos.value.x = e.clientX
    startPos.value.y = e.clientY
    startViewPos.value.x = pos.viewX
    startViewPos.value.y = pos.viewY

    document.addEventListener('mousemove', handleViewMouseMove)
    document.addEventListener('mouseup', handleViewMouseUp)
  }

  const handleViewMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    pos.viewX = e.clientX - startPos.value.x + startViewPos.value.x
    pos.viewY = e.clientY - startPos.value.y + startViewPos.value.y

    checkViewPosition()
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
    if (!info.value || imageMoving.value || props.fixedImage) return
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
  const {
    info,
    imageMoving,
    pos,
    minImageScale,
    viewportRef,
    pointPosition,
    viewResizing,
    props,
    viewMoving,
  } = options

  const { checkImageBack } = useCheckImageBack(options)
  const { resizeView } = useResizeView(options)
  const { checkViewPosition } = useCheckViewPosition(options)

  const touchStart = ref<SimplePosition>()
  const touchStartDistance = ref<number>()
  const isTwoFingerZoom = ref(false)
  const touchCenter = ref<SimplePosition>({ x: 0, y: 0 })
  const viewportPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startViewPos = ref<SimplePosition>({ x: 0, y: 0 })
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

  const handlePointTouchStart = (e: TouchEvent, position: PointPosition) => {
    if (!viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    viewResizing.value = true
    pointPosition.value = position

    const { left, top } = viewportRef.value.getBoundingClientRect()
    viewportPos.value.x = left
    viewportPos.value.y = top
    touchCenter.value.x = e.touches[0].clientX - left
    touchCenter.value.y = e.touches[0].clientY - top

    document.addEventListener('touchmove', handlePointTouchMove, { passive: false })
    document.addEventListener('touchend', handlePointTouchEnd)
    document.addEventListener('touchcancel', handlePointTouchCancel)
  }

  const handlePointTouchMove = (e: TouchEvent) => {
    if (!viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    const newPos = {
      x: e.touches[0].clientX - viewportPos.value.x,
      y: e.touches[0].clientX - viewportPos.value.y,
    }

    resizeView(newPos)

    touchCenter.value = newPos
  }

  const handlePointTouchEnd = (e: TouchEvent) => {
    if (e.touches.length > 0) return
    viewResizing.value = false
    pointPosition.value = void 0
    document.removeEventListener('touchmove', handlePointTouchMove)
    document.removeEventListener('touchend', handlePointTouchEnd)
    document.removeEventListener('touchcancel', handlePointTouchCancel)
  }

  const handlePointTouchCancel = (e: TouchEvent) => {
    handlePointTouchEnd(e)
  }

  const handleViewTouchStart = (e: TouchEvent) => {
    if (!props.fixedImage || !viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    viewMoving.value = true

    touchCenter.value.x = e.touches[0].clientX
    touchCenter.value.y = e.touches[0].clientY
    startViewPos.value.x = pos.viewX
    startViewPos.value.y = pos.viewY

    document.addEventListener('touchmove', handleViewTouchMove, { passive: false })
    document.addEventListener('touchend', handleViewTouchEnd)
    document.addEventListener('touchcancel', handleViewTouchCancel)
  }

  const handleViewTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    pos.viewX = e.touches[0].clientX - touchCenter.value.x + startViewPos.value.x
    pos.viewY = e.touches[0].clientY - touchCenter.value.y + startViewPos.value.y

    checkViewPosition()
  }

  const handleViewTouchEnd = (e: TouchEvent) => {
    if (e.touches.length > 0) return

    viewMoving.value = false

    document.removeEventListener('touchmove', handleViewTouchMove)
    document.removeEventListener('touchend', handleViewTouchEnd)
    document.removeEventListener('touchcancel', handleViewTouchCancel)
  }

  const handleViewTouchCancel = (e: TouchEvent) => {
    handleViewTouchEnd(e)
  }

  return { handleTouchStart, handlePointTouchStart, handleViewTouchStart }
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

  watch(
    () => props,
    () => {
      pos.viewportWidth = props.size ?? props.width ?? 0
      pos.viewportHeight = props.size ?? props.height ?? 0

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

    pos.imageWidth = res.width
    pos.imageHeight = res.height

    if (props.fixedImage) {
      pos.imageScale =
        Math.abs(res.width - pos.viewportWidth) > Math.abs(res.height - pos.viewportHeight)
          ? pos.viewportWidth / res.width
          : pos.viewportHeight / res.height
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

  return { initPosition }
}
