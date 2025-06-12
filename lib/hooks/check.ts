import type { HookOptions } from './types'

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
