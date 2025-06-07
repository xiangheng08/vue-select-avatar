export type ErrorCode =
  | 'UNKNOWN'
  | 'CANCEL'
  | 'NOT_IMAGE_FILE'
  | 'IMAGE_FILE_TOO_LARGE'
  | 'IMAGE_TOO_SMALL'
  | 'IMAGE_TOO_LARGE'
  | 'IMAGE_LOAD_FAILED'
  | 'CANVAS_TO_BLOB_FAILED'
  | 'BLOB_TO_BASE64_FAILED'
  | 'CANVAS_CONTEXT_NOT_DEFINED'

export type ErrorMessageMap = Record<ErrorCode, string>

export class SelectAvatarError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode) {
    super(code)
    this.code = code
  }
}

export const errorMessageMap: ErrorMessageMap = {
  UNKNOWN: '未知错误',
  CANCEL: '取消',
  NOT_IMAGE_FILE: '文件不是图片',
  IMAGE_FILE_TOO_LARGE: '图片文件过大',
  IMAGE_TOO_SMALL: '图片尺寸过小',
  IMAGE_TOO_LARGE: '图片尺寸过大',
  IMAGE_LOAD_FAILED: '图片加载失败',
  CANVAS_TO_BLOB_FAILED: 'canvas 转 blob 失败',
  BLOB_TO_BASE64_FAILED: 'blob 转 base64 失败',
  CANVAS_CONTEXT_NOT_DEFINED: 'canvas context 未定义',
}

export const isCancelError = (error: unknown): boolean => {
  return error instanceof SelectAvatarError && error.code === 'CANCEL'
}

export const getErrorMessage = (error: unknown, messageMap = errorMessageMap): string => {
  if (error instanceof SelectAvatarError) {
    return messageMap[error.code]
  }
  if (error instanceof Error) {
    return error.message
  }
  return messageMap['UNKNOWN']
}
