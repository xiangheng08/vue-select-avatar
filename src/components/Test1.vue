<script setup lang="ts">
import { reactive, ref } from 'vue'
import { formatBytes } from './utils/common'
import {
  loadImage,
  Viewport,
  type CropperOptions,
  type ImageSelectOptions,
  type ViewportProps,
} from '../../lib'

const viewportRef = ref<InstanceType<typeof Viewport>>()
const viewportProps = reactive<ViewportProps>({
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
const selectOptions: ImageSelectOptions = {
  maxFileSize: 10 * 1024 * 1024,
  compress: true,
  quality: 0.5,
}
const cropperOptions: CropperOptions = {
  size: 180,
  type: 'image/webp',
}

const src = ref('')
const imageInfoText = ref('')

const handleSelect = async () => {
  viewportRef.value?.select(selectOptions)
}

const handleCropper = async () => {
  if (src.value) {
    URL.revokeObjectURL(src.value)
  }

  const file = await viewportRef.value?.cropper(cropperOptions)

  if (file instanceof File) {
    const size = formatBytes(file.size)
    console.log(file, size)
    src.value = URL.createObjectURL(file)
    const image = await loadImage(src.value)
    imageInfoText.value = `${image.width}x${image.height} ${size}`
  }
}
</script>

<template>
  <Viewport ref="viewportRef" v-bind="viewportProps" />
  <button @click="handleSelect">选择图片</button>
  <button @click="handleCropper">截取</button>
  <el-collapse style="width: 100%">
    <el-collapse-item title="配置">
      <span>props</span>
      <el-form inline>
        <el-form-item label="size">
          <el-input-number v-model="viewportProps.size" :min="0" />
        </el-form-item>
        <el-form-item label="width">
          <el-input-number v-model="viewportProps.width" :min="0" />
        </el-form-item>
        <el-form-item label="height">
          <el-input-number v-model="viewportProps.height" :min="0" />
        </el-form-item>
        <el-form-item label="viewSize">
          <el-input-number v-model="viewportProps.viewSize" :min="0" />
        </el-form-item>
        <el-form-item label="grid">
          <el-radio-group v-model="viewportProps.grid">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="scaleStep">
          <el-input-number v-model="viewportProps.scaleStep" :min="0" />
        </el-form-item>
        <el-form-item label="ctrlScaleStep">
          <el-input-number v-model="viewportProps.ctrlScaleStep" :min="0" />
        </el-form-item>
        <el-form-item label="shiftScaleStep">
          <el-input-number v-model="viewportProps.shiftScaleStep" :min="0" />
        </el-form-item>
        <el-form-item label="wheelReverse">
          <el-radio-group v-model="viewportProps.wheelReverse">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="fixedImage">
          <el-radio-group v-model="viewportProps.fixedImage">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </el-collapse>
  <div style="display: flex; flex-direction: column; align-items: center">
    <span style="font-size: 12px; margin-bottom: 4px">{{ imageInfoText }}</span>
    <img :src="src" alt="" />
  </div>
</template>
