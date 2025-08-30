import { accept } from './data'
import { SelectAvatarError } from './error'
import type {
  CropperOptions,
  ImageInfo,
  ImageSelectOptions,
  ImageSelectResult,
  PointPosition,
  Position,
  SimplePosition,
} from './types'

export interface SelectFileOptions {
  accept?: string
  multiple?: boolean
}

/**
 * 选择文件
 * @example
 * selectFile({ accept: 'image/*', multiple: true }).then(files => {
 *     console.log(files)
 * })
 */
export const selectFile = (options?: SelectFileOptions): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    const { accept, multiple } = options || {}
    const input = document.createElement('input')
    input.type = 'file'
    if (accept) input.accept = accept
    if (multiple) input.multiple = multiple
    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length > 0) {
        resolve(files)
      } else {
        reject(new SelectAvatarError('CANCEL'))
      }
    }
    input.oncancel = () => reject(new SelectAvatarError('CANCEL'))
    input.onerror = (_event, _source, _lineno, _colno, error) =>
      reject(error || new SelectAvatarError('UNKNOWN'))
    input.click()
  })
}

/**
 * 选择并验证图片文件
 * @param options 图片选择配置选项
 * @returns 验证通过的File对象数组
 */
export const selectImage = async (options?: ImageSelectOptions): Promise<ImageSelectResult> => {
  const {
    accept: acceptType = accept,
    maxFileSize = 2 * 1024 * 1024,
    minSize,
    maxSize = 5000,
    resizeToMax = false,
    compress = false,
    quality = 0.8,
  } = options || {}

  // 选择文件
  let [file] = await selectFile({ accept: acceptType })

  // 非图片校验
  if (!file.type.startsWith('image/')) {
    throw new SelectAvatarError('NOT_IMAGE_FILE')
  }

  // 文件大小校验
  if (file.size > maxFileSize) {
    throw new SelectAvatarError('IMAGE_FILE_TOO_LARGE')
  }

  // 获取原始尺寸
  let dimensions = await getImageDimensions(file)

  // 最小尺寸校验
  if (typeof minSize === 'number' && Math.min(dimensions.width, dimensions.height) < minSize) {
    throw new SelectAvatarError('IMAGE_TOO_SMALL')
  }

  // 缩放处理
  if (Math.max(dimensions.width, dimensions.height) > maxSize) {
    if (!resizeToMax) {
      throw new SelectAvatarError('IMAGE_TOO_LARGE')
    }
    // 计算缩放比例
    const scale = maxSize / Math.max(dimensions.width, dimensions.height)
    dimensions = {
      width: Math.floor(dimensions.width * scale),
      height: Math.floor(dimensions.height * scale),
    }
  }

  if (shouldCompress(file, compress)) {
    // 压缩处理
    file = await resizeImage(file, dimensions, 'image/png', quality)
  } else if (resizeToMax) {
    // 仅缩放不压缩
    file = await resizeImage(file, dimensions, 'image/png')
  } else if (file.type !== 'image/png') {
    // 如果不是 png，则转换成 png，确保输出的图片格式是 png
    file = await resizeImage(file, dimensions, 'image/png')
  }

  return { file, ...dimensions }
}

interface ImageDimensions {
  width: number
  height: number
}

export const getImageDimensions = async (file: File): Promise<ImageDimensions> => {
  const img = await loadImage(URL.createObjectURL(file), true)
  return { width: img.width, height: img.height }
}

// 辅助函数
const shouldCompress = (file: File, compress: boolean | number) => {
  if (typeof compress === 'number') return file.size > compress
  return !!compress
}

export const resizeImage = async (
  file: File,
  dimensions: ImageDimensions,
  type?: string,
  quality?: number,
): Promise<File> => {
  const img = await loadImage(URL.createObjectURL(file), true)
  const canvas = document.createElement('canvas')
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new SelectAvatarError('CANVAS_CONTEXT_NOT_DEFINED')
  ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
  const blob = await canvasToBlob(canvas, type || file.type, quality)
  return new File([blob], file.name, { type: type || file.type })
}

export const loadImage = async (url: string, revoke = false) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      if (revoke) {
        URL.revokeObjectURL(img.src)
      }
      resolve(img)
    }
    img.onerror = () => {
      if (revoke) {
        URL.revokeObjectURL(img.src)
      }
      reject(new SelectAvatarError('IMAGE_LOAD_FAILED'))
    }
    img.src = url
  })
}

export const canvasToBlob = (canvas: HTMLCanvasElement, type?: string, quality?: number) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new SelectAvatarError('CANVAS_TO_BLOB_FAILED'))
        }
      },
      type,
      quality,
    )
  })
}

export const blobToBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new SelectAvatarError('BLOB_TO_BASE64_FAILED'))
      }
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(blob)
  })
}

export const cropper = async <T extends File | string = File | string>(
  info: ImageInfo,
  pos: Position,
  options?: CropperOptions,
): Promise<T> => {
  const {
    format = 'file',
    size,
    type = 'image/png',
    quality = 1,
    filename,
    maxSize,
    useOriginSize = true,
    backgroundColor = '#ffffff',
  } = options || {}

  let url = info.url
  let needRevoke = false
  if (!url) {
    url = URL.createObjectURL(info.file)
    needRevoke = true
  }

  const image = await loadImage(url)

  if (needRevoke) {
    URL.revokeObjectURL(url)
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new SelectAvatarError('CANVAS_CONTEXT_NOT_DEFINED')

  let s = pos.viewSize / pos.imageScale
  const x = (pos.viewX - pos.imageX) / pos.imageScale
  const y = (pos.viewY - pos.imageY) / pos.imageScale
  const l = pos.viewSize / pos.imageScale

  if (typeof size === 'number') {
    if (s > size || !useOriginSize) {
      s = size
    }
  } else if (typeof maxSize === 'number') {
    if (s > maxSize) {
      s = maxSize
    }
  }

  canvas.width = s
  canvas.height = s

  if (type === 'image/jpeg' && backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, s, s)
  }

  ctx.drawImage(image, x, y, l, l, 0, 0, s, s)

  const blob = await canvasToBlob(canvas, type, quality)

  if (format === 'file') {
    return new File([blob], filename || info.file.name, { type }) as T
  } else {
    return (await blobToBase64(blob)) as T
  }
}

export const getIsClipPathSupported = () => {
  const element = document.createElement('div')
  return 'clipPath' in element.style
}

export const getPointOffset = (value: SimplePosition, pos: Position, position: PointPosition) => {
  const v: SimplePosition = { x: 0, y: 0 }
  switch (position) {
    case 'top-left':
      v.x += value.x - pos.viewX
      v.y += value.y - pos.viewY
      break
    case 'top-right':
      v.x += value.x - (pos.viewX + pos.viewSize)
      v.y += value.y - pos.viewY
      break
    case 'bottom-left':
      v.x += value.x - pos.viewX
      v.y += value.y - (pos.viewY + pos.viewSize)
      break
    case 'bottom-right':
      v.x += value.x - (pos.viewX + pos.viewSize)
      v.y += value.y - (pos.viewY + pos.viewSize)
      break
  }
  return v
}
