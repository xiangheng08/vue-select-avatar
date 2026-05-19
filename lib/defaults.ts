import type { Position, ViewportProps } from './types'

// #region DEFAULT_ACCEPT
// 去除动图，常见的图片格式
export const DEFAULT_ACCEPT =
  'image/jpeg, image/png, image/webp, image/bmp, image/svg+xml, image/avif, image/tiff'
// #endregion DEFAULT_ACCEPT

export const DEFAULT_VIEWPORT_PROPS = Object.freeze<ViewportProps>({
  size: 300,
  view: 0.6,
  grid: false,
  step: 0.05,
  ctrlStep: 0.02,
  shiftStep: 2,
  reverse: false,
  minView: 10,
  padding: 10,
  arrow: true,
  wasd: true,
  mask: 'clip',
  mode: 'fixed-view',
  border: false,
})

export const getDefaultPosition = (): Position => {
  return {
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
  }
}
