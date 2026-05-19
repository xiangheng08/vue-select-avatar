import { t } from './locales'
import type { ErrorCode } from './types'

export class AvatarError extends Error {
  /**
   * 判断是否是 AvatarError
   */
  static is(value: unknown): value is AvatarError {
    return value instanceof AvatarError
  }

  /**
   * 判断是否是取消错误
   */
  static isCancel(value: unknown): value is AvatarError {
    return AvatarError.is(value) && value.code === 'CANCEL'
  }

  readonly code: ErrorCode

  constructor(code: ErrorCode) {
    super(t(code))
    this.name = 'AvatarError'
    this.code = code
  }
}
