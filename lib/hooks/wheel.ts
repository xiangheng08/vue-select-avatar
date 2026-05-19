import type { HookContext } from '../types'

export const useWheelHandles = (context: HookContext) => {
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
  } = context

  const getStep = (deltaY = -1) => {
    let _step = step.value
    if (props.shiftStep! > 0 && pressShift.value) {
      _step = shiftStep.value
    } else if (props.ctrlStep! > 0 && pressCtrl.value) {
      _step = ctrlStep.value
    }
    if (deltaY > 0) {
      _step = -_step
    }
    if (props.reverse) {
      _step = -_step
    }
    return _step
  }

  const handleWheel = (e: WheelEvent) => {
    if (!info.value || imageMoving.value || props.mode === 'fixed-image') return
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
    context.checkImageBack(false)
  }

  return { handleWheel }
}
