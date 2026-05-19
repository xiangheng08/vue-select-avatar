import { onUnmounted } from 'vue'

export const useEmitter = () => {
  const emitter = document.createElement('div')

  onUnmounted(() => {
    emitter.remove()
  })

  return emitter
}
