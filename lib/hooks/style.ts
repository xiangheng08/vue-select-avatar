import { reactive, watch } from 'vue'
import type { CSSProperties } from 'vue'
import type { HookOptions } from './types'

export const useStyles = (
  options: HookOptions,
): {
  viewportStyle: CSSProperties
  maskStyle: CSSProperties
  viewStyle: CSSProperties
  imageStyle: CSSProperties
  innerImageStyle: CSSProperties
  consolesStyle: CSSProperties
} => {
  const { pos, showViewLayer, props } = options

  const viewportStyle = reactive<CSSProperties>({})
  const maskStyle = reactive<CSSProperties>({})
  const viewStyle = reactive<CSSProperties>({})
  const imageStyle = reactive<CSSProperties>({})
  const innerImageStyle = reactive<CSSProperties>({})
  const consolesStyle = reactive<CSSProperties>({})

  const setStyles = () => {
    viewportStyle.width = `${pos.viewportWidth}px`
    viewportStyle.height = `${pos.viewportHeight}px`
    viewStyle.width = `${pos.viewSize}px`
    viewStyle.height = `${pos.viewSize}px`
    viewStyle.transform = `translate3d(${pos.viewX}px, ${pos.viewY}px, 0px)`
    imageStyle.width = `${pos.imageWidth}px`
    imageStyle.height = `${pos.imageHeight}px`
    imageStyle.transform = `translate3d(${pos.imageX}px, ${pos.imageY}px, 0px) scale(${pos.imageScale})`
    consolesStyle.width = `${pos.viewSize + 2}px`
    consolesStyle.height = `${pos.viewSize + 2}px`
    consolesStyle.transform = `translate3d(${pos.viewX - 1}px, ${pos.viewY - 1}px, 0px)`

    if (props.forceDoubleLayer || props.shadowMask) {
      maskStyle.clipPath = void 0
    } else {
      const x = pos.viewX
      const y = pos.viewY
      const s = pos.viewSize
      maskStyle.clipPath = `polygon(0% 0%, 0% 100%, ${x}px 100%, ${x}px ${y}px, ${x + s}px ${y}px, ${x + s}px ${y + s}px, ${x}px ${y + s}px, ${x}px 100%, 100% 100%, 100% 0%)`
    }

    if (props.shadowMask) {
      const spread = (Math.max(pos.viewportWidth, pos.viewportHeight) - pos.viewSize) / 2
      maskStyle.boxShadow = `inset ${pos.viewX - spread}px ${pos.viewY - spread}px 0px ${spread}px var(--mask-color)`
    } else {
      maskStyle.boxShadow = void 0
    }

    if (showViewLayer.value) {
      innerImageStyle.width = `${pos.imageWidth}px`
      innerImageStyle.height = `${pos.imageHeight}px`
      innerImageStyle.transform = `translate3d(${pos.imageX - pos.viewX}px, ${pos.imageY - pos.viewY}px, 0px) scale(${pos.imageScale})`
    }
  }

  watch([pos, showViewLayer, () => props.forceDoubleLayer, () => props.shadowMask], setStyles, {
    deep: true,
    immediate: true,
  })

  return { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle, consolesStyle }
}
