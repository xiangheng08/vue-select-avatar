import type { HookContext } from '../types'
import { reactive, watchEffect, type CSSProperties } from 'vue'
import { isValidBorder, resolveSize } from '../utils'

export const useStyles = (
  context: HookContext,
): {
  viewportStyle: CSSProperties
  maskStyle: CSSProperties
  viewStyle: CSSProperties
  imageStyle: CSSProperties
  innerImageStyle: CSSProperties
  consolesStyle: CSSProperties
} => {
  const { pos, showViewLayer, props } = context

  const viewportStyle = reactive<CSSProperties>({})
  const maskStyle = reactive<CSSProperties>({})
  const viewStyle = reactive<CSSProperties>({})
  const imageStyle = reactive<CSSProperties>({})
  const innerImageStyle = reactive<CSSProperties>({})
  const consolesStyle = reactive<CSSProperties>({})

  watchEffect(() => {
    const { width, height } = resolveSize(props)
    const borderWidth = isValidBorder(props.border) ? Number(props.border) : 1

    viewportStyle.width = width === 'full' ? '100%' : `${pos.viewportWidth}px`
    viewportStyle.height = height === 'full' ? '100%' : `${pos.viewportHeight}px`
    viewportStyle['--border-width'] = `${borderWidth}px`
    imageStyle.width = `${pos.imageWidth}px`
    imageStyle.height = `${pos.imageHeight}px`
    imageStyle.transform = `translate3d(${pos.imageX}px, ${pos.imageY}px, 0px) scale(${pos.imageScale})`

    if (props.mode === 'fixed-image' || isValidBorder(props.border)) {
      viewStyle.width = `${pos.viewSize + borderWidth * 2}px`
      viewStyle.height = `${pos.viewSize + borderWidth * 2}px`
      viewStyle.transform = `translate3d(${pos.viewX - borderWidth}px, ${pos.viewY - borderWidth}px, 0px)`
    } else {
      viewStyle.width = `${pos.viewSize}px`
      viewStyle.height = `${pos.viewSize}px`
      viewStyle.transform = `translate3d(${pos.viewX}px, ${pos.viewY}px, 0px)`
    }

    consolesStyle.width = `${pos.viewSize + borderWidth * 2}px`
    consolesStyle.height = `${pos.viewSize + borderWidth * 2}px`
    consolesStyle.transform = `translate3d(${pos.viewX - borderWidth}px, ${pos.viewY - borderWidth}px, 0px)`

    if (props.mask === 'clip') {
      const { viewX: x, viewY: y, viewSize: s } = pos
      maskStyle.clipPath = `polygon(0% 0%, 0% 100%, ${x}px 100%, ${x}px ${y}px, ${x + s}px ${y}px, ${x + s}px ${y + s}px, ${x}px ${y + s}px, ${x}px 100%, 100% 100%, 100% 0%)`
    } else {
      maskStyle.clipPath = void 0
    }

    if (showViewLayer.value) {
      innerImageStyle.width = `${pos.imageWidth}px`
      innerImageStyle.height = `${pos.imageHeight}px`
      innerImageStyle.transform = `translate3d(${pos.imageX - pos.viewX}px, ${pos.imageY - pos.viewY}px, 0px) scale(${pos.imageScale})`
    }
  })

  return { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle, consolesStyle }
}
