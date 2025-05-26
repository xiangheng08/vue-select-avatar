import { accept } from './data'
import type {
  CropperOptions,
  ImageInfo,
  ImageSelectOptions,
  ImageSelectResult,
  Position,
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
        reject(new Error('CANCEL'))
      }
    }
    input.oncancel = () => reject(new Error('CANCEL'))
    input.onerror = (_event, _source, _lineno, _colno, error) => reject(error)
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

  // 文件大小验证
  if (file.size > maxFileSize) {
    throw new Error('FILE_SIZE_EXCEEDED')
  }

  // 获取原始尺寸
  let dimensions = await getImageDimensions(file)

  // 最小尺寸验证
  if (typeof minSize === 'number' && Math.min(dimensions.width, dimensions.height) < minSize) {
    throw new Error('IMAGE_TOO_SMALL')
  }

  // 缩放处理
  if (Math.max(dimensions.width, dimensions.height) > maxSize) {
    if (!resizeToMax) {
      throw new Error('IMAGE_TOO_LARGE')
    }
    // 计算缩放比例
    const scale = maxSize / Math.max(dimensions.width, dimensions.height)
    dimensions = {
      width: Math.floor(dimensions.width * scale),
      height: Math.floor(dimensions.height * scale),
    }
  }

  // 压缩处理
  if (shouldCompress(file, compress)) {
    file = await compressImage(file, quality, dimensions)
  } else if (resizeToMax) {
    // 仅缩放不压缩
    file = await resizeImage(file, dimensions)
  }

  return { file, ...dimensions }
}

interface ImageDimensions {
  width: number
  height: number
}

export const getImageDimensions = async (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// 辅助函数
const shouldCompress = (file: File, compress: boolean | number) => {
  if (typeof compress === 'number') return file.size > compress
  return !!compress
}

export const resizeImage = async (file: File, dimensions: ImageDimensions): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: file.type }))
        URL.revokeObjectURL(img.src)
      }, file.type)
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export const compressImage = async (
  file: File,
  quality: number,
  dimensions: ImageDimensions,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: file.type }))
          URL.revokeObjectURL(img.src)
        },
        file.type,
        quality,
      )
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export const loadImage = async (url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
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
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      type,
      quality,
    )
  })
}

const blobToBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to base64'))
      }
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(blob)
  })
}

export const cropper = async (info: ImageInfo, pos: Position, options?: CropperOptions) => {
  const { format = 'file', size, type = 'image/png', quality = 1, filename } = options || {}

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

  if (!ctx) throw new Error('Canvas context is null')

  const s = size || pos.viewSize / pos.imageScale
  const x = (pos.viewX - pos.imageX) / pos.imageScale
  const y = (pos.viewY - pos.imageY) / pos.imageScale
  const l = pos.viewSize / pos.imageScale

  canvas.width = s
  canvas.height = s

  ctx.drawImage(image, x, y, l, l, 0, 0, s, s)

  const blob = await canvasToBlob(canvas, type, quality)

  if (format === 'file') {
    return new File([blob], filename || info.file.name, { type })
  } else {
    return blobToBase64(blob)
  }
}
