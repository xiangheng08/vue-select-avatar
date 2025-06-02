import type Viewport from './Viewport.vue'

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
   * 缩放步长（按下Ctrl键时）（设置为0时，则不生效）
   */
  ctrlScaleStep?: number
  /**
   * 缩放步长（按下Shift键时）（设置为0时，则不生效）
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
  /**
   * 图片边距
   */
  imagePadding?: number
  /**
   * 方向键移动
   */
  directionKey?: boolean
  /**
   * wasd 键移动
   */
  wasdKey?: boolean
  /**
   * 尺寸是否显示 // TODO 待实现
   */
  showSize?: boolean
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
   * 最大输出图片尺寸（如果截取图片尺寸超过该值则等比例缩放到该尺寸，如果设置了 size，该属性则无效）
   */
  maxSize?: number
  /**
   * 如果截取图片尺寸小于 size 时，则使用截取图片的尺寸
   * （如果还是使用 size 作为图片尺寸，则会将图片等比例放大，会造成文件大小变大）
   * （仅在设置了 size 时生效）
   */
  useOriginSize?: boolean
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
  /**
   * 当输出图片类型为 image/jpeg 的底色
   */
  backgroundColor?: string
}

export type PointPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface PreviewProps {
  size?: number
  viewportRef?: InstanceType<typeof Viewport>
  round?: boolean
  bg?: string
}
