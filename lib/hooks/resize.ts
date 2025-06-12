import type { HookOptions } from './types'
import type { SimplePosition } from '../types'

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
