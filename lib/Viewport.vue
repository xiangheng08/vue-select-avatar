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
  type HookOptions,
} from './hooks'
import type { CropperOptions, ImageSelectOptions, PointPosition, ViewportProps } from './types'

const props = withDefaults(defineProps<ViewportProps>(), {
  size: 300,
  viewSize: 180,
  grid: false,
  scaleStep: 10,
  ctrlScaleStep: 5,
  shiftScaleStep: 1,
  wheelReverse: false,
  fixedImage: false,
  minViewSize: 10,
})

const pos = reactive(getDefaultPosition())
const info = useImageInfo()
const src = computed(() => info.value?.url)
const imageMoving = ref(false)
const viewMoving = ref(false)
const viewResizing = ref(false)
const viewportRef = ref<HTMLElement>()
const minImageScale = ref(0)
const step = ref(0)
const ctrlStep = ref(0)
const shiftStep = ref(0)
const pressCtrl = usePressKey('Control')
const pressShift = usePressKey('Shift')
const isClipPathSupported = ref(getIsClipPathSupported())
const pointPosition = ref<PointPosition>()

const { backing, handleTransitionEnd } = useBacking({ imageMoving })

const hookOptions: HookOptions = {
  props,
  pos,
  info,
  imageMoving,
  viewMoving,
  viewResizing,
  viewportRef,
  minImageScale,
  step,
  ctrlStep,
  shiftStep,
  pressCtrl,
  pressShift,
  isClipPathSupported,
  pointPosition,
  backing,
}

const { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle } = useStyles(hookOptions)

const { initPosition } = useInitPosition(hookOptions)
const { handleMouseDown, handlePointMouseDown, handleViewMouseDown } = useMouseHandles(hookOptions)
const { handleWheel } = useWheelHandles(hookOptions)
const { handleTouchStart, handlePointTouchStart, handleViewTouchStart } =
  useTouchHandles(hookOptions)

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
    :class="[
      {
        grid,
        backing,
        'image-moving': imageMoving,
        'view-moving': viewMoving,
        'view-resizing': viewResizing,
        'fixed-image': fixedImage,
      },
      pointPosition,
    ]"
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
    <div
      class="consoles"
      :style="viewStyle"
      v-if="fixedImage"
      @mousedown="handleViewMouseDown"
      @touchstart="handleViewTouchStart"
    >
      <div class="line top"><slot name="line-top"></slot></div>
      <div class="line right"><slot name="line-right"></slot></div>
      <div class="line bottom"><slot name="line-bottom"></slot></div>
      <div class="line left"><slot name="line-left"></slot></div>
      <div
        class="point top-left"
        @mousedown="handlePointMouseDown($event, 'top-left')"
        @touchstart="handlePointTouchStart($event, 'top-left')"
      >
        <slot name="point-top-left"></slot>
      </div>
      <div
        class="point top-right"
        @mousedown="handlePointMouseDown($event, 'top-right')"
        @touchstart="handlePointTouchStart($event, 'top-right')"
      >
        <slot name="point-top-right"></slot>
      </div>
      <div
        class="point bottom-left"
        @mousedown="handlePointMouseDown($event, 'bottom-left')"
        @touchstart="handlePointTouchStart($event, 'bottom-left')"
      >
        <slot name="point-bottom-left"></slot>
      </div>
      <div
        class="point bottom-right"
        @mousedown="handlePointMouseDown($event, 'bottom-right')"
        @touchstart="handlePointTouchStart($event, 'bottom-right')"
      >
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
  &:not(.fixed-image) {
    cursor: grab;
  }
  &.image-moving {
    cursor: grabbing;
  }
  &:not(.view-resizing) {
    .consoles {
      cursor: grab;
    }
  }
  &.view-moving {
    cursor: grabbing;
    .consoles {
      cursor: grabbing;
    }
  }
  &.view-resizing {
    &.top-left {
      cursor: nwse-resize;
    }
    &.top-right {
      cursor: nesw-resize;
    }
    &.bottom-left {
      cursor: nesw-resize;
    }
    &.bottom-right {
      cursor: nwse-resize;
    }
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
    width: 101%;
    height: 101%;
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
        cursor: nwse-resize;
      }
      &.top-right {
        right: calc(0px - var(--point-size));
        top: calc(0px - var(--point-size));
        cursor: nesw-resize;
      }
      &.bottom-left {
        left: calc(0px - var(--point-size));
        bottom: calc(0px - var(--point-size));
        cursor: nesw-resize;
      }
      &.bottom-right {
        right: calc(0px - var(--point-size));
        bottom: calc(0px - var(--point-size));
        cursor: nwse-resize;
      }
    }
  }
}
</style>
