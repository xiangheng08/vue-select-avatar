import type { ComputedRef, Reactive, Ref } from 'vue'
import type Viewport from './components/Viewport.vue'

// #region ViewportInstance
export type ViewportInstance = InstanceType<typeof Viewport>
// #endregion ViewportInstance

// #region Position
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
// #endregion Position

export interface SimplePosition {
  x: number
  y: number
}

// #region ViewportProps
export interface ViewportProps {
  /**
   * 视口尺寸（同时设置宽高）
   *
   * @default 300
   */
  size?: number | 'full'
  /**
   * 视口宽度（覆盖size）
   */
  width?: number | 'full'
  /**
   * 视口高度（覆盖size）
   */
  height?: number | 'full'
  /**
   * 图片信息
   */
  info?: ImageInfo
  /**
   * 观察窗口大小（<=1 表示比例，>1 表示像素值）
   *
   * @default 0.6
   */
  view?: number
  /**
   * 是否为网格背景
   *
   * @default false
   */
  grid?: boolean
  /**
   * 缩放步长（<1 表示比例，>=1 表示像素值）
   *
   * @default 0.05
   */
  step?: number
  /**
   * 缩放步长（按下Ctrl键时，设置为0时，则不生效，<1 表示比例，>=1 表示像素值）
   *
   * @default 0.02
   */
  ctrlStep?: number
  /**
   * 缩放步长（按下Shift键时，设置为0时，则不生效，<1 表示比例，>=1 表示像素值）
   *
   * @default 2
   */
  shiftStep?: number
  /**
   * 滚轮反向
   *
   * @default false
   */
  reverse?: boolean
  /**
   * 最小观察窗口尺寸（mode=fixed-image 时生效）
   *
   * @default 10
   */
  minView?: number
  /**
   * 图片边距（mode=fixed-image 时生效）
   *
   * @default 10
   */
  padding?: number
  /**
   * 方向键移动
   *
   * @default true
   */
  arrow?: boolean
  /**
   * wasd 键移动
   *
   * @default true
   */
  wasd?: boolean
  /**
   * 遮罩实现方式
   *
   * - 'clip'：使用 clip-path
   * - 'double'：使用双层图片
   *
   * @default 'clip'
   */
  mask?: 'clip' | 'double'
  /**
   * 移动模式：'fixed-view'=观察窗固定图片移动，'fixed-image'=图片固定观察窗移动
   *
   * @default 'fixed-view'
   */
  mode?: 'fixed-view' | 'fixed-image'
  /**
   * 是否显示观察窗边框
   *
   * @default false
   */
  border?: boolean | number
}
// #endregion ViewportProps

// #region ViewportExposes
export interface ViewportExposes {
  /**
   * 选择图片
   * @param options 选择图片选项
   */
  select: (options?: ImageSelectOptions) => Promise<void>
  /**
   * 裁剪图片
   * @param options 裁剪选项
   * @returns 裁剪后的图片信息
   */
  crop: <T extends File | string = string | File>(options?: CropOptions) => Promise<T>
  /**
   * 初始化位置信息
   * @param res 图片信息
   */
  positionInit: (res: ImageSelectResult) => void
}
// #endregion ViewportExposes

// #region ImageSelectOptions
export interface ImageSelectOptions {
  /**
   * 允许的文件类型（参考input的accept属性）
   *
   * @default DEFAULT_ACCEPT
   */
  accept?: string
  /**
   * 最大文件大小（单位：字节）
   * @default 2 * 1024 * 1024
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
  /**
   * 矢量图最小尺寸
   * @default 1024
   */
  minVectorSize?: number
}
// #endregion ImageSelectOptions

// #region ImageSelectResult
export interface ImageSelectResult {
  file: File
  width: number
  height: number
}
// #endregion ImageSelectResult

export interface ImageInfo extends ImageSelectResult {
  url?: string
}

export type CropFormat = 'file' | 'base64'

// #region CropOptions
export interface CropOptions {
  /**
   * 数据格式
   */
  format?: CropFormat
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
// #endregion CropOptions

export type PointPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

// #region PreviewProps
export interface PreviewProps {
  /**
   * 预览尺寸
   *
   * @default 180
   */
  size?: number | 'full'
  /**
   * 视口实例
   */
  viewportRef?: ViewportInstance
  /**
   * 是否圆形
   */
  round?: boolean
  /**
   * 背景颜色
   */
  bg?: string
}
// #endregion PreviewProps

// #region ErrorCode
type ErrorCode =
  | 'UNKNOWN' // 未知错误
  | 'CANCEL' // 取消
  | 'NOT_IMAGE_FILES' // 非图片文件
  | 'IMAGE_FILE_TOO_LARGE' // 图片文件过大
  | 'IMAGE_TOO_SMALL' // 图片尺寸过小
  | 'IMAGE_TOO_LARGE' // 图片尺寸过大
  | 'IMAGE_LOAD_FAILED' // 图片加载失败
  | 'CANVAS_TO_BLOB_FAILED' // canvas 转 blob 失败
  | 'BLOB_TO_BASE64_FAILED' // blob 转 base64 失败
  | 'CANVAS_CONTEXT_NOT_DEFINED' // canvas context 未定义
  | 'NO_IMAGE_SELECTED' // 未选择图片
// #endregion ErrorCode

/**
 * 多语言key
 */
export type Locale = {
  [K in ErrorCode]: string
}

export interface HookContext {
  props: ViewportProps
  pos: Reactive<Position>
  info: Ref<ImageInfo | undefined>
  imageMoving: Ref<boolean, boolean>
  viewMoving: Ref<boolean, boolean>
  viewResizing: Ref<boolean, boolean>
  viewportRef: Ref<HTMLElement | undefined>
  minImageScale: Ref<number>
  step: Ref<number>
  ctrlStep: Ref<number>
  shiftStep: Ref<number>
  pressCtrl: Ref<boolean>
  pressShift: Ref<boolean>
  isClipPathSupported: Ref<boolean>
  pointPosition: Ref<PointPosition | undefined>
  backing: Ref<boolean>
  elEmitter: HTMLElement
  showViewLayer: ComputedRef<boolean>
  checkImageBack: (transition?: boolean) => void
  checkViewPosition: () => void
  resizeView: (newPos: SimplePosition) => void
  broadcastInfo: () => void
  broadcastPos: () => void
}

type NativeType = null | undefined | number | string | boolean | symbol | Function
type InferDefault<P, T> = ((props: P) => T & {}) | (T extends NativeType ? T : never)
export type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}
