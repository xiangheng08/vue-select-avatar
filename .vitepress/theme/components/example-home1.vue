<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Viewport } from '../../../lib'
import { loadCatImage } from '../utils/image'

const viewportRef = ref<InstanceType<typeof Viewport>>()

const load = async () => {
  const res = await loadCatImage()
  viewportRef.value?.initPosition(res)
}

onMounted(load)
</script>

<template>
  <button @click="viewportRef?.select()">选择图片</button>
  <Viewport ref="viewportRef" grid />
</template>
