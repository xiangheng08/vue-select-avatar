import { ref } from 'vue'
import { getPointOffset } from '../utils'
import type { HookContext, PointPosition, SimplePosition } from '../types'

export const useMouseHandles = (context: HookContext) => {
  const { imageMoving, viewMoving, viewResizing, info, pos, props, viewportRef, pointPosition } =
    context

  const lastPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startPos = ref<SimplePosition>({ x: 0, y: 0 })
  const startViewPos = ref<SimplePosition>({ x: 0, y: 0 })
  const viewportPos = ref<SimplePosition>({ x: 0, y: 0 })
  const pointOffset = ref<SimplePosition>({ x: 0, y: 0 })

  const handleMouseDown = (e: MouseEvent) => {
    if (props.mode === 'fixed-image') return handleViewMouseDown(e)
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
    context.checkImageBack()
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

    context.resizeView(newPos)

    lastPos.value = newPos
  }

  const handlePointMouseUp = () => {
    viewResizing.value = false
    pointPosition.value = void 0
    document.removeEventListener('mousemove', handlePointMouseMove)
    document.removeEventListener('mouseup', handlePointMouseUp)
  }

  const handleViewMouseDown = (e: MouseEvent) => {
    if (props.mode === 'fixed-view' || !viewportRef.value) return

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

    context.checkViewPosition()
  }

  const handleViewMouseUp = () => {
    viewMoving.value = false
    document.removeEventListener('mousemove', handleViewMouseMove)
    document.removeEventListener('mouseup', handleViewMouseUp)
  }

  return { handleMouseDown, handlePointMouseDown }
}
