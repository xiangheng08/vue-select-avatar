<script setup lang="ts">
import { getDefaultPosition } from './data'
import { computed, onUnmounted, reactive, ref } from 'vue'
import { cropper as cropperFn, getIsClipPathSupported, selectImage } from './utils'
import {
  useBacking,
  useMouseHandles,
  usePressKey,
  useStyles,
  useTouchHandles,
  useWheelHandles,
} from './hooks'
import type {
  CropperOptions,
  ImageInfo,
  ImageSelectOptions,
  ImageSelectResult,
  ViewportProps,
} from './types'

const props = withDefaults(defineProps<ViewportProps>(), {
  size: 300,
  viewSize: 180,
  scaleStep: 10,
  ctrlScaleStep: 5,
  shiftScaleStep: 1,
  wheelReverse: false,
})

const pos = reactive(getDefaultPosition(props))
const info = ref<ImageInfo>()
const src = computed(() => info.value?.url)
const moving = ref(false)
const viewportRef = ref<HTMLElement>()
const minImageScale = ref(0)
const isClipPathSupported = ref(getIsClipPathSupported())
const step = ref(0)
const ctrlStep = ref(0)
const shiftStep = ref(0)
const pressCtrl = usePressKey('Control')
const pressShift = usePressKey('Shift')

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

const initImageInfo = (res: ImageSelectResult) => {
  if (info.value?.url) {
    URL.revokeObjectURL(info.value.url)
  }

  info.value = res
  info.value.url = URL.createObjectURL(res.file)

  pos.imageWidth = res.width
  pos.imageHeight = res.height
  pos.imageScale = Math.max(pos.viewSize / res.width, pos.viewSize / res.height)
  pos.imageX = (pos.viewportWidth - res.width * pos.imageScale) / 2
  pos.imageY = (pos.viewportHeight - res.height * pos.imageScale) / 2
  minImageScale.value = pos.imageScale
  step.value = minImageScale.value * (props.scaleStep / pos.viewSize)
  ctrlStep.value = minImageScale.value * (props.ctrlScaleStep / pos.viewSize)
  shiftStep.value = minImageScale.value * (props.shiftScaleStep / pos.viewSize)
}

const { handleMouseDown } = useMouseHandles({ moving, checkImageBack, info, pos })

const { handleWheel } = useWheelHandles({
  moving,
  checkImageBack,
  info,
  pos,
  viewportRef,
  minImageScale,
  getStep,
})

const { handleTouchStart } = useTouchHandles({
  info,
  moving,
  pos,
  minImageScale,
  viewportRef,
  checkImageBack,
})

const select = async (options?: ImageSelectOptions) => {
  const res = await selectImage(options)
  initImageInfo(res)
}

const cropper = async (options?: CropperOptions) => {
  if (!info.value) throw new Error('Please select an image first')
  return cropperFn(info.value, pos, options)
}

onUnmounted(() => {
  if (info.value?.url) {
    URL.revokeObjectURL(info.value.url)
  }
})

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
