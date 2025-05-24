import { watchEffect, reactive } from 'vue'
import type { CSSProperties } from 'vue'
import type { Position } from './types'

export const useStyles = (pos: Position) => {
  const viewportStyle = reactive<CSSProperties>({})
  const viewStyle = reactive<CSSProperties>({})
  const imageStyle = reactive<CSSProperties>({})
  const innerImageStyle = reactive<CSSProperties>({})

  watchEffect(() => {
    viewportStyle.width = `${pos.viewportWidth}px`
    viewportStyle.height = `${pos.viewportHeight}px`
    viewStyle.width = `${pos.viewSize}px`
    viewStyle.height = `${pos.viewSize}px`
    viewStyle.transform = `translate3d(${pos.viewX}px, ${pos.viewY}px, 0px)`
    imageStyle.width = `${pos.imageWidth}px`
    imageStyle.height = `${pos.imageHeight}px`
    imageStyle.transform = `scale(${pos.imageScale}) translate3d(${pos.imageX}px, ${pos.imageY}px, 0px)`
    innerImageStyle.width = `${pos.imageWidth}px`
    innerImageStyle.height = `${pos.imageHeight}px`
    innerImageStyle.transform = `scale(${pos.imageScale}) translate3d(${pos.imageX - pos.viewX}px, ${pos.imageY - pos.viewY}px, 0px)`
  })

  return { viewportStyle, viewStyle, imageStyle, innerImageStyle }
}
