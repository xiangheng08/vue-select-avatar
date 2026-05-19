import type { Locale } from '../types'

export default {
  UNKNOWN: '未知错误',
  CANCEL: '取消',
  NOT_IMAGE_FILES: '非图片文件',
  IMAGE_FILE_TOO_LARGE: '图片文件过大',
  IMAGE_TOO_SMALL: '图片尺寸过小',
  IMAGE_TOO_LARGE: '图片尺寸过大',
  IMAGE_LOAD_FAILED: '图片加载失败',
  CANVAS_TO_BLOB_FAILED: 'canvas 转 blob 失败',
  BLOB_TO_BASE64_FAILED: 'blob 转 base64 失败',
  CANVAS_CONTEXT_NOT_DEFINED: 'canvas context 未定义',
  NO_IMAGE_SELECTED: '未选择图片',
} satisfies Locale
