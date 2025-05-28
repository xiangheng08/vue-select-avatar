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
  imageScale: number
}

export interface SimplePosition {
  x: number
  y: number
}

export interface ViewportProps {
  size?: number
  width?: number
  height?: number
  /**
   * 观察窗口大小
   */
  viewSize?: number
  /**
   * 是否为网格背景
   */
  grid?: boolean
  /**
   * 缩放步长
   */
  scaleStep?: number
  /**
   * 缩放步长（按下Ctrl键时）
   */
  ctrlScaleStep?: number
  /**
   * 缩放步长（按下Shift键时）
   */
  shiftScaleStep?: number
  /**
   * 滚轮反向
   */
  wheelReverse?: boolean
  /**
   * 图片固定模式：true=固定图片移动视窗，false=固定视窗移动图片（默认）
   */
  fixedImage?: boolean
  /**
   * 最小观察窗口尺寸
   */
  minViewSize?: number
}

export interface ImageSelectOptions {
  /**
   * 允许的文件类型（参考input的accept属性）
   */
  accept?: string

  /**
   * 最大文件大小（单位：字节）
   * @default 2 * 1024 * 1024 // 2MB
   */
  maxFileSize?: number

  /**
   * 图片最小尺寸（宽高任一小于该值则无效）
   */
  minSize?: number

  /**
   * 图片最大尺寸（宽高任一超过该值则无效）
   * @default 5000
   */
  maxSize?: number

  /**
   * 超过最大尺寸时是否等比例缩放到最大尺寸
   * @default false
   */
  resizeToMax?: boolean

  /**
   * 是否启用压缩
   * - true：全部压缩
   * - number：文件大于该值时压缩（单位：字节）
   * @default false
   */
  compress?: boolean | number

  /**
   * 压缩质量（0-1）
   * @default 0.8
   */
  quality?: number
}

export interface ImageSelectResult {
  file: File
  width: number
  height: number
}

export interface ImageInfo extends ImageSelectResult {
  url?: string
}

export type CropperFormat = 'file' | 'base64'

export interface CropperOptions {
  /**
   * 数据格式
   */
  format?: CropperFormat
  /**
   * 输出图片尺寸
   */
  size?: number
  /**
   * 输出图片类型
   */
  type?: 'image/jpeg' | 'image/png' | 'image/webp'
  /**
   * 输出图片质量（0-1）
   */
  quality?: number
  /**
   * 文件名
   */
  filename?: string
}

export type PointPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
