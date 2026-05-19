import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 某个键按下
 */
export const useKeyPress = (key: string) => {
  const press = ref(false)

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === key) {
      press.value = true
    }
  }
  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === key) {
      press.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('keyup', handleKeyup)
  })

  return press
}
