import { ref, watch, type Ref } from 'vue'

interface BackingOptions {
  imageMoving: Ref<boolean>
}
export const useBacking = (options: BackingOptions) => {
  const { imageMoving } = options

  const backing = ref(false)

  const handleTransitionEnd = (event: TransitionEvent) => {
    if ('propertyName' in event && event.propertyName !== 'transform') return
    backing.value = false
  }

  watch(imageMoving, (val) => {
    if (val) {
      // 开始移动时，停止回弹
      backing.value = false
    }
  })

  return { backing, handleTransitionEnd }
}
