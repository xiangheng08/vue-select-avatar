import { watchEffect, reactive } from 'vue'
import type { CSSProperties } from 'vue'
import type { Position } from './types'

export const useStyles = (
  pos: Position,
): {
  viewportStyle: CSSProperties
  maskStyle: CSSProperties
  viewStyle: CSSProperties
  imageStyle: CSSProperties
  innerImageStyle: CSSProperties
} => {
  const viewportStyle = reactive<CSSProperties>({})
  const maskStyle = reactive<CSSProperties>({})
  const viewStyle = reactive<CSSProperties>({})
  const imageStyle = reactive<CSSProperties>({})
  const innerImageStyle = reactive<CSSProperties>({})

  watchEffect(() => {
    const pX = (pos.viewportWidth - pos.viewSize) / 2
    const pY = (pos.viewportHeight - pos.viewSize) / 2
    const p2X = pos.viewportWidth - pX
    const p2Y = pos.viewportHeight - pY
    viewportStyle.width = `${pos.viewportWidth}px`
    viewportStyle.height = `${pos.viewportHeight}px`
    maskStyle.clipPath = `polygon(0% 0%, 0% 100%, ${pX}px 100%, ${pX}px ${pY}px, ${p2X}px ${pY}px, ${p2X}px ${p2Y}px, ${pX}px ${p2Y}px, ${pX}px 100%, 100% 100%, 100% 0%)`
    viewStyle.width = `${pos.viewSize}px`
    viewStyle.height = `${pos.viewSize}px`
    viewStyle.transform = `translate3d(${pos.viewX}px, ${pos.viewY}px, 0px)`
    imageStyle.width = `${pos.imageWidth}px`
    imageStyle.height = `${pos.imageHeight}px`
    imageStyle.transform = `translate3d(${pos.imageX}px, ${pos.imageY}px, 0px) scale(${pos.imageScale})`
    innerImageStyle.width = `${pos.imageWidth}px`
    innerImageStyle.height = `${pos.imageHeight}px`
    innerImageStyle.transform = `translate3d(${pos.imageX - pos.viewX}px, ${pos.imageY - pos.viewY}px, 0px) scale(${pos.imageScale})`
  })

  return { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle }
}
