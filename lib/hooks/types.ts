import type { ComputedRef, Reactive, Ref } from 'vue'
import type { ImageInfo, PointPosition, Position, ViewportProps } from '../types'

export interface HookOptions {
  props: ViewportProps
  pos: Reactive<Position>
  info: Ref<ImageInfo | undefined>
  imageMoving: Ref<boolean, boolean>
  viewMoving: Ref<boolean, boolean>
  viewResizing: Ref<boolean, boolean>
  viewportRef: Ref<HTMLElement | undefined>
  minImageScale: Ref<number>
  step: Ref<number>
  ctrlStep: Ref<number>
  shiftStep: Ref<number>
  pressCtrl: Ref<boolean>
  pressShift: Ref<boolean>
  isClipPathSupported: Ref<boolean>
  pointPosition: Ref<PointPosition | undefined>
  backing: Ref<boolean>
  elEmitter: HTMLElement
  showViewLayer: ComputedRef<boolean>
}
