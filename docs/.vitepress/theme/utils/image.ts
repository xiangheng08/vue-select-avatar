import { withBase } from 'vitepress'
import { loadImage, canvasToBlob } from 'vue-select-avatar'
import type { ImageSelectResult } from 'vue-select-avatar'

export const loadCatImage = async (): Promise<ImageSelectResult> => {
  const _document = globalThis.document

  if (!_document) {
    throw new Error('document is not defined')
  }

  const image = await loadImage(withBase('/cat.jpeg'))
  const canvas = _document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(image, 0, 0)
  const blob = await canvasToBlob(canvas, 'image/jpeg')
  const file = new File([blob], 'cat.jpeg', { type: 'image/jpeg' })
  return {
    file,
    width: image.width,
    height: image.height,
  }
}
