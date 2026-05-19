import { onUnmounted, reactive, ref, watch } from 'vue'
import { getDefaultPosition } from '../defaults'
import type { HookContext, ImageInfo, Position, PreviewProps } from '../types'

const BROADCAST_EVENT_INFO = 'broadcast:info'
const BROADCAST_EVENT_POS = 'broadcast:pos'

export const useBroadcast = (context: HookContext) => {
  const { elEmitter } = context
  const emitter = document.createElement('div')

  context.broadcastInfo = () => {
    elEmitter.dispatchEvent(
      new CustomEvent(BROADCAST_EVENT_INFO, {
        detail: {
          ...context.info.value,
        },
      }),
    )
  }

  context.broadcastPos = () => {
    elEmitter.dispatchEvent(
      new CustomEvent(BROADCAST_EVENT_POS, {
        detail: {
          ...context.pos,
        },
      }),
    )
  }

  watch(() => context.pos, context.broadcastPos, { deep: true })

  return { emitter }
}

export const useBroadcastReceiver = (props: PreviewProps) => {
  const pos = reactive(getDefaultPosition())
  const info = ref<ImageInfo>()

  const handleBroadcastInfo = (e: CustomEvent<ImageInfo>) => {
    info.value = e.detail
  }
  const handleBroadcastPos = (e: CustomEvent<Position>) => {
    Object.assign(pos, e.detail)
  }

  let removes = () => {}

  watch(
    () => props.viewportRef,
    (viewportRef) => {
      removes()
      if (!viewportRef?.elEmitter) return
      const elEmitter = viewportRef.elEmitter
      elEmitter.addEventListener(BROADCAST_EVENT_INFO, handleBroadcastInfo as any)
      elEmitter.addEventListener(BROADCAST_EVENT_POS, handleBroadcastPos as any)
      removes = () => {
        elEmitter.removeEventListener(BROADCAST_EVENT_INFO, handleBroadcastInfo as any)
        elEmitter.removeEventListener(BROADCAST_EVENT_POS, handleBroadcastPos as any)
      }
    },
    { immediate: true },
  )

  onUnmounted(removes)

  return { pos, info }
}
