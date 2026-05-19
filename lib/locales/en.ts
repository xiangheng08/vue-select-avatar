import type { Locale } from '../types'

export default {
  UNKNOWN: 'Unknown error',
  CANCEL: 'Canceled',
  NOT_IMAGE_FILES: 'File is not an image',
  IMAGE_FILE_TOO_LARGE: 'Image file is too large',
  IMAGE_TOO_SMALL: 'Image dimensions are too small',
  IMAGE_TOO_LARGE: 'Image dimensions are too large',
  IMAGE_LOAD_FAILED: 'Image load failed',
  CANVAS_TO_BLOB_FAILED: 'Failed to convert canvas to blob',
  BLOB_TO_BASE64_FAILED: 'Failed to convert blob to base64',
  CANVAS_CONTEXT_NOT_DEFINED: 'Canvas context is undefined',
  NO_IMAGE_SELECTED: 'No image selected',
} satisfies Locale
