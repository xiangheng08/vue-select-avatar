<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useBroadcastReceiver } from '../hooks'
import type { PreviewProps } from '../types'

const props = withDefaults(defineProps<PreviewProps>(), {
  size: 180,
})

const { pos, info } = useBroadcastReceiver(props)
const containerRef = ref<HTMLDivElement>()
const innerSize = ref(0)

const setFullSize = () => {
  if (props.size === 'full' && containerRef.value) {
    containerRef.value.classList.add('full-gauging')
    innerSize.value = Math.min(containerRef.value.clientWidth, containerRef.value.clientHeight)
    containerRef.value.classList.remove('full-gauging')
  }
}

onMounted(setFullSize)

watch(
  () => props.size,
  (val) => {
    if (typeof val === 'number') {
      innerSize.value = val
    } else {
      setFullSize()
    }
  },
  { immediate: true },
)

const backing = computed(() => props.viewportRef?.backing)
const style = computed(() => {
  return {
    width: `${innerSize.value}px`,
    height: `${innerSize.value}px`,
    '--bg': props.bg,
  }
})
const imageStyle = computed(() => {
  const s = innerSize.value / (pos.viewSize / pos.imageScale)
  const x = ((pos.imageX - pos.viewX) / pos.imageScale) * s
  const y = ((pos.imageY - pos.viewY) / pos.imageScale) * s
  return {
    watch: `${pos.imageWidth}px`,
    height: `${pos.imageHeight}px`,
    transform: `translate3d(${x}px, ${y}px, 0px) scale(${s})`,
  }
})
</script>

<template>
  <div class="preview" ref="containerRef" :style="style" :class="{ backing, round }">
    <img class="image" :src="info.url" alt="image" :style="imageStyle" v-if="info?.url" />
  </div>
</template>

<style lang="scss" scoped>
.preview {
  overflow: hidden;
  position: relative;
  background: var(--bg);
  flex-shrink: 0;
  box-sizing: content-box;

  &.full-gauging {
    width: 100% !important;
    height: 100% !important;
  }

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
