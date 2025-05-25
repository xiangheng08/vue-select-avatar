<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useStyles } from './hooks'
import { selectImage } from './utils'
import { getDefaultPosition } from './data'
import type { ImageSelectOptions, ViewportProps } from './types'

const props = withDefaults(defineProps<ViewportProps>(), {
  size: 300,
  viewSize: 180,
})

const pos = reactive(getDefaultPosition(props))
const src = ref('')

const { viewportStyle, viewStyle, imageStyle, innerImageStyle } = useStyles(pos)

defineExpose({
  select(options?: ImageSelectOptions) {
    selectImage(options).then((res) => {
      console.log(res)

      pos.imageWidth = res.width
      pos.imageHeight = res.height
      pos.imageScale = Math.max(pos.viewSize / res.width, pos.viewSize / res.height)
      pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
      pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
      src.value = URL.createObjectURL(res.file)

      console.log(src.value)
    })
  },
})
</script>

<template>
  <div class="viewport" :style="viewportStyle">
    <img class="image" :src="src" alt="image" :style="imageStyle" />
    <div class="mask"></div>
    <div class="view" :style="viewStyle">
      <img class="inner-image" :src="src" alt="inner-image" :style="innerImageStyle" />
    </div>
    <div class="event-layer"></div>
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
    background-color: rgba(0, 0, 0, 0.2);
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
