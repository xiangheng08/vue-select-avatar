<script setup lang="ts">
import { getDefaultPosition } from './data'
import { computed, reactive, ref } from 'vue'
import { cropper as cropperFn, getIsClipPathSupported, selectImage } from './utils'
import {
  useBacking,
  useImageInfo,
  useInitPosition,
  useMouseHandles,
  usePressKey,
  useStyles,
  useTouchHandles,
  useWheelHandles,
} from './hooks'
import type { CropperOptions, ImageSelectOptions, ViewportProps } from './types'

const props = withDefaults(defineProps<ViewportProps>(), {
  size: 300,
  viewSize: 180,
  grid: false,
  scaleStep: 10,
  ctrlScaleStep: 5,
  shiftScaleStep: 1,
  wheelReverse: false,
  fixedImage: false,
})

const pos = reactive(getDefaultPosition())
const info = useImageInfo()
const src = computed(() => info.value?.url)
const moving = ref(false)
const viewportRef = ref<HTMLElement>()
const minImageScale = ref(0)
const step = ref(0)
const ctrlStep = ref(0)
const shiftStep = ref(0)
const pressCtrl = usePressKey('Control')
const pressShift = usePressKey('Shift')
const isClipPathSupported = ref(getIsClipPathSupported())

const { backing, handleTransitionEnd } = useBacking({ moving })

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

const getStep = (deltaY = -1) => {
  let _step = step.value
  if (pressShift.value) {
    _step = shiftStep.value
  } else if (pressCtrl.value) {
    _step = ctrlStep.value
  }
  if (deltaY > 0) {
    _step = -_step
  }
  if (props.wheelReverse) {
    _step = -_step
  }
  return _step
}

const { initPosition } = useInitPosition({
  props,
  pos,
  info,
  minImageScale,
  step,
  ctrlStep,
  shiftStep,
})

const { handleMouseDown, handlePointMouseDown } = useMouseHandles({
  moving,
  checkImageBack,
  info,
  pos,
  props,
})

const { handleWheel } = useWheelHandles({
  moving,
  checkImageBack,
  info,
  pos,
  viewportRef,
  minImageScale,
  getStep,
  props,
})

const { handleTouchStart } = useTouchHandles({
  info,
  moving,
  pos,
  minImageScale,
  viewportRef,
  checkImageBack,
  props,
})

const select = async (options?: ImageSelectOptions) => {
  const res = await selectImage(options)
  initPosition(res)
}

const cropper = async (options?: CropperOptions) => {
  if (!info.value) throw new Error('Please select an image first')
  return cropperFn(info.value, pos, options)
}

defineExpose({ select, cropper })
</script>

<template>
  <div
    class="viewport"
    :style="viewportStyle"
    :class="{ grid, moving, backing }"
    ref="viewportRef"
    @mousedown="handleMouseDown"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
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
    <!-- 如果支持 clip-path 属性，则不渲染 view，已减少性能消耗 -->
    <div class="view" :style="viewStyle" v-if="src && !isClipPathSupported">
      <img class="inner-image" :src="src" alt="inner-image" :style="innerImageStyle" />
    </div>
    <div class="consoles" :style="viewStyle" v-if="fixedImage">
      <div class="line top"><slot name="line-top"></slot></div>
      <div class="line right"><slot name="line-right"></slot></div>
      <div class="line bottom"><slot name="line-bottom"></slot></div>
      <div class="line left"><slot name="line-left"></slot></div>
      <div class="point top-left" @mousedown="handlePointMouseDown($event, 'top-left')">
        <slot name="point-top-left"></slot>
      </div>
      <div class="point top-right" @mousedown="handlePointMouseDown($event, 'top-right')">
        <slot name="point-top-right"></slot>
      </div>
      <div class="point bottom-left" @mousedown="handlePointMouseDown($event, 'bottom-left')">
        <slot name="point-bottom-left"></slot>
      </div>
      <div class="point bottom-right" @mousedown="handlePointMouseDown($event, 'bottom-right')">
        <slot name="point-bottom-right"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.viewport {
  --line-color: #fff;
  --point-size: 10px;
  --mask-color: rgba(0, 0, 0, 0.5);

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
      transition: transform 0.3s ease;
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
    background-color: var(--mask-color);
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
  .consoles {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    .line {
      position: absolute;
      background-color: var(--line-color);
      &.top {
        left: -1px;
        top: -1px;
        width: calc(100% + 2px);
        height: 1px;
      }
      &.right {
        right: -1px;
        top: -1px;
        width: 1px;
        height: calc(100% + 2px);
      }
      &.bottom {
        left: -1px;
        bottom: -1px;
        width: calc(100% + 2px);
        height: 1px;
      }
      &.left {
        left: -1px;
        top: -1px;
        width: 1px;
        height: calc(100% + 2px);
      }
    }
    .point {
      position: absolute;
      width: var(--point-size);
      height: var(--point-size);
      border: 1px solid var(--line-color);
      &.top-left {
        left: calc(0px - var(--point-size));
        top: calc(0px - var(--point-size));
        cursor: se-resize;
      }
      &.top-right {
        right: calc(0px - var(--point-size));
        top: calc(0px - var(--point-size));
        cursor: sw-resize;
      }
      &.bottom-left {
        left: calc(0px - var(--point-size));
        bottom: calc(0px - var(--point-size));
        cursor: ne-resize;
      }
      &.bottom-right {
        right: calc(0px - var(--point-size));
        bottom: calc(0px - var(--point-size));
        cursor: nw-resize;
      }
    }
  }
}
</style>
