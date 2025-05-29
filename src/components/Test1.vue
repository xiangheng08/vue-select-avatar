<script setup lang="ts">
import { reactive, ref } from 'vue'
import { formatBytes } from './utils/common'
import {
  loadImage,
  Viewport,
  accept,
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
  imagePadding: 10,
  directionKey: true,
  wasdKey: true,
})
const selectOptions = reactive<ImageSelectOptions>({
  accept,
  maxFileSize: 20 * 1024 * 1024,
  maxSize: 5000,
  resizeToMax: false,
  compress: false,
  quality: 0.8,
})
const cropperOptions = reactive<CropperOptions>({
  format: 'file',
  useOriginSize: true,
  type: 'image/png',
  quality: 1,
  backgroundColor: '#ffffff',
})

const src = ref('')
const imageInfoText = ref('')
const compressType = ref(0)

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
  } else if (typeof file === 'string') {
    src.value = file
    const image = await loadImage(src.value)
    imageInfoText.value = `${image.width}x${image.height} ${formatBytes(file.length)}`
  }
}

const fn = (n?: unknown) => (typeof n === 'number' ? formatBytes(n) : '')
</script>

<template>
  <Viewport ref="viewportRef" v-bind="viewportProps" />
  <button @click="handleSelect">选择图片</button>
  <button @click="handleCropper">截取</button>
  <el-collapse style="width: 100%">
    <el-collapse-item title="配置" style="padding: 0 20px">
      <div style="font-size: 16px; margin-bottom: 6px">props</div>
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
        <el-form-item label="minViewSize">
          <el-input-number v-model="viewportProps.minViewSize" :min="0" />
        </el-form-item>
        <el-form-item label="imagePadding">
          <el-input-number v-model="viewportProps.imagePadding" :min="0" />
        </el-form-item>
        <el-form-item label="directionKey">
          <el-radio-group v-model="viewportProps.directionKey">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="wasdKey">
          <el-radio-group v-model="viewportProps.wasdKey">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div style="font-size: 16px; margin-bottom: 6px; margin-top: 30px">ImageSelectOptions</div>
      <el-form inline>
        <el-form-item label="accept">
          <el-input v-model="selectOptions.accept" />
        </el-form-item>
        <el-form-item label="maxFileSize">
          <el-input-number v-model="selectOptions.maxFileSize" :min="0" />{{
            fn(selectOptions.maxFileSize)
          }}
        </el-form-item>
        <el-form-item label="minSize">
          <el-input-number v-model="selectOptions.minSize" :min="0" />
        </el-form-item>
        <el-form-item label="maxSize">
          <el-input-number v-model="selectOptions.maxSize" :min="0" />
        </el-form-item>
        <el-form-item label="resizeToMax">
          <el-radio-group v-model="selectOptions.resizeToMax">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="compress">
          <el-radio-group v-model="compressType">
            <el-radio :value="0">boolean</el-radio>
            <el-radio :value="1">number</el-radio>
          </el-radio-group>
          <div style="width: 10px"></div>
          <el-input-number v-model="selectOptions.compress" :min="0" v-if="compressType === 1" />
          <el-radio-group v-model="selectOptions.compress" v-if="compressType === 0">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="quality">
          <el-input-number v-model="selectOptions.quality" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <div style="font-size: 16px; margin-bottom: 6px; margin-top: 30px">CropperOptions</div>
      <el-form inline>
        <el-form-item label="format">
          <el-select v-model="cropperOptions.format" style="width: 240px">
            <el-option label="file" value="file" />
            <el-option label="base64" value="base64" />
          </el-select>
        </el-form-item>
        <el-form-item label="size">
          <el-input-number v-model="cropperOptions.size" :min="0" clearable />
        </el-form-item>
        <el-form-item label="maxSize">
          <el-input-number v-model="cropperOptions.maxSize" :min="0" clearable />
        </el-form-item>
        <el-form-item label="useOriginSize">
          <el-radio-group v-model="cropperOptions.useOriginSize">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="type">
          <el-select v-model="cropperOptions.type" style="width: 240px">
            <el-option label="image/jpeg" value="image/jpeg" />
            <el-option label="image/png" value="image/png" />
            <el-option label="image/webp" value="image/webp" />
          </el-select>
        </el-form-item>
        <el-form-item label="quality">
          <el-input-number v-model="cropperOptions.quality" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="filename">
          <el-input v-model="cropperOptions.filename" clearable />
        </el-form-item>
        <el-form-item label="backgroundColor">
          <el-color-picker
            v-model="cropperOptions.backgroundColor"
            show-alpha
            :predefine="[
              '#ffffff',
              '#000000',
              '#ff4500',
              '#ff8c00',
              '#ffd700',
              '#90ee90',
              '#00ced1',
              '#1e90ff',
              '#c71585',
              'rgba(255, 69, 0, 0.68)',
              'rgb(255, 120, 0)',
              'hsv(51, 100, 98)',
              'hsva(120, 40, 94, 0.5)',
              'hsl(181, 100%, 37%)',
              'hsla(209, 100%, 56%, 0.73)',
              '#c7158577',
            ]"
          />
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </el-collapse>
  <div style="display: flex; flex-direction: column; align-self: flex-start; padding: 0 20px 20px">
    <span style="font-size: 12px; margin: 0 0 4px 0">{{ imageInfoText }}</span>
    <img :src="src" alt="" />
  </div>
</template>
