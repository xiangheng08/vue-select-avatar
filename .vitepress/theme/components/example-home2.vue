<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Viewport, Preview } from '../../../lib'
import { loadCatImage } from '../utils/image'

const viewportRef = ref<InstanceType<typeof Viewport>>()

onMounted(async () => {
  const res = await loadCatImage()
  viewportRef.value?.initPosition(res)
})
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: center; margin-top: 50px">
    <div style="display: flex; gap: 40px; align-items: center">
      <Viewport ref="viewportRef" :size="180" fixed-image />
      <div style="width: 1px; height: 180px; background-color: var(--vp-c-border)"></div>
      <Preview :viewport-ref="viewportRef" :size="96" round />
    </div>
    <div style="margin-top: 20px; font-size: 13px">仿哔哩哔哩头像选择</div>
  </div>
</template>
