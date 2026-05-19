<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { AvatarError } from '../error'
import { crop, getIsClipPathSupported, isValidBorder, selectImage } from '../utils'
import { DEFAULT_VIEWPORT_PROPS, getDefaultPosition } from '../defaults'
import {
  useBacking,
  useCheckImageBack,
  useCheckViewPosition,
  useEmitter,
  useImageInfo,
  useKeyMove,
  useKeyPress,
  useMouseHandles,
  useInit,
  useResizeView,
  useStyles,
  useTouchHandles,
  useWheelHandles,
  useBroadcast,
} from '../hooks'
import type {
  CropOptions,
  HookContext,
  ImageSelectOptions,
  InferDefaults,
  PointPosition,
  ViewportProps,
} from '../types'

const props = withDefaults(defineProps<ViewportProps>(), {
  ...(DEFAULT_VIEWPORT_PROPS as InferDefaults<ViewportProps>),
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
const pressCtrl = useKeyPress('Control')
const pressShift = useKeyPress('Shift')
const isClipPathSupported = ref(getIsClipPathSupported())
const pointPosition = ref<PointPosition>()
const showViewLayer = computed(
  () => props.mask === 'double' || (!!src.value && !isClipPathSupported.value),
)

const elEmitter = useEmitter()
const { backing, handleTransitionEnd } = useBacking({ imageMoving })

const hookOptions: HookContext = {
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
  elEmitter,
  showViewLayer,
  checkImageBack: () => {},
  checkViewPosition: () => {},
  resizeView: () => {},
  broadcastInfo: () => {},
  broadcastPos: () => {},
}

useBroadcast(hookOptions)
useCheckImageBack(hookOptions)
useCheckViewPosition(hookOptions)
useResizeView(hookOptions)
useKeyMove(hookOptions)

const { viewportStyle, maskStyle, viewStyle, imageStyle, innerImageStyle, consolesStyle } =
  useStyles(hookOptions)
const { positionInit } = useInit(hookOptions)
const { handleMouseDown, handlePointMouseDown } = useMouseHandles(hookOptions)
const { handleWheel } = useWheelHandles(hookOptions)
const { handleTouchStart, handlePointTouchStart } = useTouchHandles(hookOptions)

const select = async (options?: ImageSelectOptions) => {
  try {
    const res = await selectImage(options)
    positionInit(res)
  } catch (error) {
    // 忽略取消错误
    if (AvatarError.isCancel(error)) return
    throw error
  }
}

const innerCrop = async <T extends File | string = File | string>(options?: CropOptions) => {
  if (!info.value) throw new AvatarError('NO_IMAGE_SELECTED')
  return crop<T>(info.value, pos, options)
}

defineExpose({ select, crop: innerCrop, positionInit, elEmitter, backing })
</script>

<template>
  <div
    class="viewport"
    :style="viewportStyle"
    :class="[
      mode,
      pointPosition,
      {
        grid,
        backing,
        'image-moving': imageMoving,
        'view-moving': viewMoving,
        'view-resizing': viewResizing,
        'show-border': isValidBorder(props.border),
      },
    ]"
    ref="viewportRef"
    @mousedown="handleMouseDown"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
  >
    <img
      class="image"
      alt="bottom layer image"
      :src="src"
      :style="imageStyle"
      v-if="src"
      @transitionend="handleTransitionEnd"
    />
    <div class="mask" :style="maskStyle"></div>
    <div class="view" :style="viewStyle" v-if="showViewLayer">
      <img class="upper-image" :src="src" alt="upper layer image" :style="innerImageStyle" />
    </div>
    <div class="consoles" :style="consolesStyle" v-if="mode === 'fixed-image'">
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
  --bg-color: #000;
  --border-width: 1px;

  position: relative;
  overflow: hidden;
  background-color: var(--bg-color);
  flex-shrink: 0;

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
    .upper-image {
      transition: transform 0.3s ease;
    }
  }

  &.show-border {
    .view {
      border: var(--border-width) solid var(--line-color);
    }
  }

  .image {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    pointer-events: none;
    user-select: none;
    max-width: unset;
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

  .upper-image {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    pointer-events: none;
    user-select: none;
    max-width: unset;
  }

  .consoles {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    border: var(--border-width) solid var(--line-color);

    .point {
      position: absolute;
      width: var(--point-size);
      height: var(--point-size);
      border: var(--border-width) solid var(--line-color);

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
