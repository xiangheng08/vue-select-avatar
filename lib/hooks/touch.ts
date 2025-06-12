import { ref } from 'vue'
import { useResizeView } from './resize'
import { getPointOffset } from '../utils'
import { useCheckImageBack, useCheckViewPosition } from './check'
import type { HookOptions } from './types'
import type { PointPosition, SimplePosition } from '../types'

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
  const pointOffset = ref<SimplePosition>({ x: 0, y: 0 })
  const handleTouchStart = (e: TouchEvent) => {
    if (props.fixedImage) return handleViewTouchStart(e)
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

    if (!isTwoFingerZoom.value) {
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

    pointOffset.value = getPointOffset(touchCenter.value, pos, position)
    touchCenter.value.x -= pointOffset.value.x
    touchCenter.value.y -= pointOffset.value.y

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
      y: e.touches[0].clientY - viewportPos.value.y,
    }

    newPos.x -= pointOffset.value.x
    newPos.y -= pointOffset.value.y

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

  return { handleTouchStart, handlePointTouchStart }
}
