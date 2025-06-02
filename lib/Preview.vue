<script setup lang="ts">
import { getDefaultPosition } from './data'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import type { ImageInfo, Position, PreviewProps } from './types'

const props = withDefaults(defineProps<PreviewProps>(), {
  size: 180,
})

const pos = reactive(getDefaultPosition())
const info = ref<ImageInfo>()

const backing = computed(() => props.viewportRef?.backing)
const style = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    '--bg': props.bg,
  }
})

const imageStyle = computed(() => {
  const s = props.size / (pos.viewSize / pos.imageScale)
  const x = ((pos.imageX - pos.viewX) / pos.imageScale) * s
  const y = ((pos.imageY - pos.viewY) / pos.imageScale) * s
  return {
    watch: `${pos.imageWidth}px`,
    height: `${pos.imageHeight}px`,
    transform: `translate3d(${x}px, ${y}px, 0px) scale(${s})`,
  }
})

const handleBroadcastInfo = (e: CustomEvent<ImageInfo>) => {
  info.value = e.detail
}
const handleBroadcastPos = (e: CustomEvent<Position>) => {
  Object.assign(pos, e.detail)
}

let removes = () => {}

watch(
  () => props.viewportRef,
  (viewportRef) => {
    if (viewportRef) {
      viewportRef.elEmitter.addEventListener('broadcast:info', handleBroadcastInfo as any)
      viewportRef.elEmitter.addEventListener('broadcast:pos', handleBroadcastPos as any)
      removes = () => {
        viewportRef.elEmitter.removeEventListener('broadcast:info', handleBroadcastInfo as any)
        viewportRef.elEmitter.removeEventListener('broadcast:pos', handleBroadcastPos as any)
      }
    }
  },
)

onUnmounted(removes)
</script>

<template>
  <div class="preview" :style="style" :class="{ backing, round }">
    <img class="image" :src="info.url" alt="image" :style="imageStyle" v-if="info?.url" />
  </div>
</template>

<style lang="scss" scoped>
.preview {
  overflow: hidden;
  position: relative;
  background: var(--bg);
  &.backing {
    .image {
      transition: transform 0.3s ease;
    }
  }
  &.round {
    border-radius: 50%;
  }
  .image {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: left top;
    max-width: unset;
  }
}
</style>
