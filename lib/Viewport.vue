<script setup lang="ts">
import { useStyles } from './hooks'
import { getDefaultPosition } from './data'
import { computed, onUnmounted, reactive, ref } from 'vue'
import { cropper, getIsClipPathSupported, selectImage } from './utils'
import type {
  CropperOptions,
  ImageInfo,
  ImageSelectOptions,
  SimplePosition,
  ViewportProps,
} from './types'

const props = withDefaults(defineProps<ViewportProps>(), {
  size: 300,
  viewSize: 180,
  scaleStep: 0.05,
})

const pos = reactive(getDefaultPosition(props))
const info = ref<ImageInfo>()
const src = computed(() => info.value?.url)
const moving = ref(false)
const backing = ref(false)
const lastPos: SimplePosition = { x: 0, y: 0 }
const viewportRef = ref<HTMLElement>()
const minImageScale = ref(0)
const isClipPathSupported = ref(getIsClipPathSupported())

const { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle } = useStyles(pos)

// 检查图片是否需要回正位置
const checkImageBack = (transition = true) => {
  if (!info.value) return

  const imageWidth = pos.imageWidth * pos.imageScale
  const imageHeight = pos.imageHeight * pos.imageScale

  // 修正 x 轴边界
  let newX = pos.imageX
  if (newX > pos.viewX) {
    newX = pos.viewX
  } else if (newX < pos.viewX + pos.viewSize - imageWidth) {
    newX = pos.viewX + pos.viewSize - imageWidth
  }

  // 修正 y 轴边界
  let newY = pos.imageY
  if (newY > pos.viewY) {
    newY = pos.viewY
  } else if (newY < pos.viewY + pos.viewSize - imageHeight) {
    newY = pos.viewY + pos.viewSize - imageHeight
  }

  if (newX !== pos.imageX || newY !== pos.imageY) {
    pos.imageX = newX
    pos.imageY = newY
    backing.value = transition
  }
}

const handleMouseDown = (e: MouseEvent) => {
  if (!info.value) return
  e.preventDefault()
  e.stopPropagation()
  lastPos.x = e.clientX
  lastPos.y = e.clientY
  moving.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!moving.value) return
  e.preventDefault()
  e.stopPropagation()
  pos.imageX += e.clientX - lastPos.x
  pos.imageY += e.clientY - lastPos.y
  lastPos.x = e.clientX
  lastPos.y = e.clientY
}

const handleMouseUp = () => {
  moving.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  checkImageBack()
}

const handleWheel = (e: WheelEvent) => {
  if (!info.value || moving.value) return
  e.preventDefault()
  e.stopPropagation()

  // 获取视口位置和尺寸
  const viewport = viewportRef.value!
  const rect = viewport.getBoundingClientRect()
  const vx = e.clientX - rect.left // 鼠标在视口中的X坐标
  const vy = e.clientY - rect.top // 鼠标在视口中的Y坐标

  const oldScale = pos.imageScale
  const delta = e.deltaY > 0 ? -props.scaleStep : props.scaleStep
  const newScale = Math.max(minImageScale.value, oldScale + delta) // 避免缩放过小

  // 以鼠标为中心缩放
  pos.imageX = vx - (vx - pos.imageX) * (newScale / oldScale)
  pos.imageY = vy - (vy - pos.imageY) * (newScale / oldScale)

  pos.imageScale = newScale
  checkImageBack(false)
}

const handleTransitionEnd = () => {
  backing.value = false
}

onUnmounted(() => {
  if (info.value?.url) {
    URL.revokeObjectURL(info.value.url)
  }
})

defineExpose({
  select(options?: ImageSelectOptions) {
    selectImage(options).then((res) => {
      info.value = res
      info.value.url = URL.createObjectURL(res.file)

      pos.imageWidth = res.width
      pos.imageHeight = res.height
      pos.imageScale = Math.max(pos.viewSize / res.width, pos.viewSize / res.height)
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
      minImageScale.value = pos.imageScale
    })
  },
  async cropper(options?: CropperOptions) {
    if (!info.value) throw new Error('Please select an image first')
    return cropper(info.value, pos, options)
  },
})
</script>

<template>
  <div
    class="viewport"
    :style="viewportStyle"
    :class="{ grid, moving, backing }"
    ref="viewportRef"
    @mousedown="handleMouseDown"
    @wheel="handleWheel"
  >
    <img
      class="image"
      :src="src"
      alt="image"
      :style="imageStyle"
      v-if="src"
      @transitionend="handleTransitionEnd"
    />
    <div class="mask" :style="maskStyle"></div>
    <div class="view" :style="viewStyle">
      <!-- 如果支持 clip-path 属性，则不渲染 inner-image，已减少性能消耗 -->
      <img
        class="inner-image"
        :src="src"
        alt="inner-image"
        :style="innerImageStyle"
        v-if="src && !isClipPathSupported"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.viewport {
  position: relative;
  overflow: hidden;
  &,
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  &.moving {
    cursor: grabbing;
  }
  &.grid {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
  }
  &.backing {
    .image,
    .inner-image {
      transition: transform 0.2s ease;
    }
  }
  .image {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    pointer-events: none;
    user-select: none;
  }
  .mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
  .view {
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    transform-origin: left top;
  }
  .inner-image {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    pointer-events: none;
    user-select: none;
  }
}
</style>
