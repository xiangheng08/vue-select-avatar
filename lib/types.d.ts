/**
 * 位置信息
 */
export interface Position {
  viewportWidth: number
  viewportHeight: number
  viewX: number
  viewY: number
  viewSize: number
  imageX: number
  imageY: number
  imageWidth: number
  imageHeight: number
}

export interface ViewportProps {
  size?: number
  width?: number
  height?: number
  viewSize?: number
}
