<script setup lang="ts">
import 'vue-select-avatar/style.css'
import { Viewport, Preview } from 'vue-select-avatar'

import { onMounted, ref } from 'vue'
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
      <div style="position: relative">
        <Viewport ref="viewportRef" :size="180" fixed-image />
        <button
          style="
            position: absolute;
            left: 50%;
            top: calc(100% + 4px);
            transform: translateX(-50%);
            font-size: 12px;
            display: flex;
            align-items: center;
          "
          @click="viewportRef?.select({ maxFileSize: 20 * 1024 * 1024 })"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
            style="display: inline; margin-right: 4px"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4.75 10.75h-3m12.5-2c0 3-2.798 5.5-6.25 5.5c-3.75 0-6.25-3.5-6.25-3.5v3.5m9.5-9h3m-12.5 2c0-3 2.798-5.5 6.25-5.5c3.75 0 6.25 3.5 6.25 3.5v-3.5"
            />
          </svg>
          重新选择
        </button>
      </div>
      <div style="width: 1px; height: 180px; background-color: var(--vp-c-border)"></div>
      <Preview :viewport-ref="viewportRef" :size="96" round />
    </div>
    <div style="margin-top: 50px; font-size: 13px">仿哔哩哔哩头像选择</div>
  </div>
</template>
