import { ref } from 'vue'
import { useResizeView } from './resize'
import { getPointOffset } from '../utils'
import { useCheckImageBack, useCheckViewPosition } from './check'
import type { HookOptions } from './types'
import type { PointPosition, SimplePosition } from '../types'

export const useMouseHandles = (options: HookOptions) => {
  const { imageMoving, viewMoving, viewResizing, info, pos, props, viewportRef, pointPosition } =
    options

  const lastPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startViewPos = ref<SimplePosition>({ x: 0, y: 0 })
  const viewportPos = ref<SimplePosition>({ x: 0, y: 0 })
  const pointOffset = ref<SimplePosition>({ x: 0, y: 0 })

  const { checkImageBack } = useCheckImageBack(options)
  const { resizeView } = useResizeView(options)
  const { checkViewPosition } = useCheckViewPosition(options)

  const handleMouseDown = (e: MouseEvent) => {
    if (props.fixedImage) return handleViewMouseDown(e)
    if (!info.value) return

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

    pointOffset.value = getPointOffset(lastPos.value, pos, position)
    lastPos.value.x -= pointOffset.value.x
    lastPos.value.y -= pointOffset.value.y

    document.addEventListener('mousemove', handlePointMouseMove)
    document.addEventListener('mouseup', handlePointMouseUp)
  }

  const handlePointMouseMove = (e: MouseEvent) => {
    if (!viewportRef.value) return

    e.preventDefault()
    e.stopPropagation()

    const newPos = { x: e.clientX - viewportPos.value.x, y: e.clientY - viewportPos.value.y }
    newPos.x -= pointOffset.value.x
    newPos.y -= pointOffset.value.y

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

  return { handleMouseDown, handlePointMouseDown }
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
    if (props.shiftScaleStep! > 0 && pressShift.value) {
      _step = shiftStep.value
    } else if (props.ctrlScaleStep! > 0 && pressCtrl.value) {
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
