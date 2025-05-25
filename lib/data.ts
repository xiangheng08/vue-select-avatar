import type { Position, ViewportProps } from './types'

// 去除动图，常见的图片格式
export const accept =
  'image/jpeg, image/png, image/webp, image/bmp, image/svg+xml, image/avif, image/tiff'

export const getDefaultPosition = (props?: ViewportProps): Position => {
  const pos = {
    viewportWidth: props?.width ?? props?.size ?? 0,
    viewportHeight: props?.height ?? props?.size ?? 0,
    viewX: 0,
    viewY: 0,
    viewSize: props?.viewSize ?? 0,
    imageX: 0,
    imageY: 0,
    imageWidth: 0,
    imageHeight: 0,
    imageScale: 1,
  }

  pos.viewX = (pos.viewportWidth - pos.viewSize) / 2
  pos.viewY = (pos.viewportHeight - pos.viewSize) / 2

  return pos
}
