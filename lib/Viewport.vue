<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { useStyles } from './hooks'
import { selectImage } from './utils'
import { getDefaultPosition } from './data'
import type { ImageInfo, ImageSelectOptions, SimplePosition, ViewportProps } from './types'

const props = withDefaults(defineProps<ViewportProps>(), {
  size: 300,
  viewSize: 180,
  scaleStep: 0.05,
})

const pos = reactive(getDefaultPosition(props))
const info = ref<ImageInfo>()
const src = computed(() => info.value?.url)
const moving = ref(false)
const lastPos: SimplePosition = { x: 0, y: 0 }

const { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle } = useStyles(pos)

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
}

const handleWheel = (e: WheelEvent) => {
  if (!info.value || moving.value) return
  e.preventDefault()
  e.stopPropagation()
  if (e.deltaY > 0) {
    pos.imageScale -= props.scaleStep
  } else {
    pos.imageScale += props.scaleStep
  }
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
    })
  },
})
</script>

<template>
  <div class="viewport" :style="viewportStyle" :class="{ grid, moving }">
    <img class="image" :src="src" alt="image" :style="imageStyle" v-if="src" />
    <div class="mask" :style="maskStyle"></div>
    <div class="view" :style="viewStyle">
      <img class="inner-image" :src="src" alt="inner-image" :style="innerImageStyle" v-if="src" />
    </div>
    <div class="event-layer" @mousedown="handleMouseDown" @wheel="handleWheel"></div>
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
  &.grid {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
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
  .event-layer {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
