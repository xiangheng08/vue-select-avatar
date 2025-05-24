import type { Position } from './types'

// 去除动图，常见的图片格式
export const accept =
  'image/jpeg, image/png, image/webp, image/bmp, image/svg+xml, image/avif, image/tiff'

export const getDefaultPosition = (): Position => ({
  viewportWidth: 0,
  viewportHeight: 0,
  viewX: 0,
  viewY: 0,
  viewSize: 0,
  imageX: 0,
  imageY: 0,
  imageWidth: 0,
  imageHeight: 0,
  imageScale: 1,
})
