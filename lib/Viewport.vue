<script setup lang="ts">
import { reactive } from 'vue'
import { useStyles } from './hooks'
import { getDefaultPosition } from './data'
import type { ImageSelectOptions, ViewportProps } from './types'
import { selectImage } from './utils'

defineProps<ViewportProps>()

const pos = reactive(getDefaultPosition())

const { viewportStyle, viewStyle, imageStyle, innerImageStyle } = useStyles(pos)

defineExpose({
  select(options?: ImageSelectOptions) {
    selectImage(options).then((res) => {
      console.log(res)
      console.log(URL.createObjectURL(res.file))
    })
  },
})
</script>

<template>
  <div class="viewport" :style="viewportStyle">
    <img src="" alt="" :style="imageStyle" />
    <div class="mask"></div>
    <div class="view" :style="viewStyle">
      <img src="" alt="" :style="innerImageStyle" />
    </div>
  </div>
</template>
