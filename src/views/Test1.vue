<script setup lang="ts">
import { reactive, ref } from 'vue'
import { formatBytes } from '../utils/common'
import {
  loadImage,
  Viewport,
  Preview,
  DEFAULT_ACCEPT,
  DEFAULT_VIEWPORT_PROPS,
  type CropOptions,
  type ImageSelectOptions,
  type ViewportProps,
  type PreviewProps,
  type ViewportInstance,
} from '../../lib'

const viewportRef = ref<ViewportInstance>()
const viewportProps = reactive<ViewportProps>({ ...DEFAULT_VIEWPORT_PROPS })
const selectOptions = reactive<ImageSelectOptions>({
  accept: DEFAULT_ACCEPT,
  maxFileSize: 20 * 1024 * 1024,
  maxSize: 5000,
  resizeToMax: false,
  compress: false,
  quality: 0.8,
})
const cropOptions = reactive<CropOptions>({
  format: 'file',
  useOriginSize: true,
  type: 'image/png',
  quality: 1,
  backgroundColor: '#ffffff',
})
const previewProps = reactive<PreviewProps>({
  size: 'full',
})

const src = ref('')
const imageInfoText = ref('')
const compressType = ref(0)

const handleSelect = async () => {
  viewportRef.value?.select(selectOptions)
  console.log(viewportRef.value)
}

const handleCropper = async () => {
  if (src.value) {
    URL.revokeObjectURL(src.value)
  }

  const file = await viewportRef.value?.crop(cropOptions)

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

const defaultViewportProps = JSON.stringify(viewportProps)
const defaultSelectOptions = JSON.stringify(selectOptions)
const defaultCropperOptions = JSON.stringify(cropOptions)
const defaultPreviewProps = JSON.stringify(previewProps)

const handleSave = () => {
  localStorage.setItem('viewportProps', JSON.stringify(viewportProps))
  localStorage.setItem('selectOptions', JSON.stringify(selectOptions))
  localStorage.setItem('cropperOptions', JSON.stringify(cropOptions))
  localStorage.setItem('previewProps', JSON.stringify(previewProps))
}
const handleReset = () => {
  Object.assign(viewportProps, JSON.parse(defaultViewportProps))
  Object.assign(selectOptions, JSON.parse(defaultSelectOptions))
  Object.assign(cropOptions, JSON.parse(defaultCropperOptions))
  Object.assign(previewProps, JSON.parse(defaultPreviewProps))
}
try {
  const data = JSON.parse(localStorage.getItem('viewportProps') || '{}')
  Object.assign(viewportProps, data)
} catch (error) {
  console.error(error)
  localStorage.removeItem('viewportProps')
}
try {
  const data = JSON.parse(localStorage.getItem('selectOptions') || '{}')
  Object.assign(selectOptions, data)
} catch (error) {
  console.error(error)
  localStorage.removeItem('selectOptions')
}
try {
  const data = JSON.parse(localStorage.getItem('cropperOptions') || '{}')
  Object.assign(cropOptions, data)
} catch (error) {
  console.error(error)
  localStorage.removeItem('cropperOptions')
}
try {
  const data = JSON.parse(localStorage.getItem('previewProps') || '{}')
  Object.assign(previewProps, data)
} catch (error) {
  console.error(error)
  localStorage.removeItem('previewProps')
}
</script>

<template>
  <Viewport ref="viewportRef" v-bind="viewportProps" :border="2" />
  <div style="width: 200px; height: 200px">
    <Preview :viewport-ref="viewportRef" v-bind="previewProps" />
  </div>
  <button @click="handleSelect">选择图片</button>
  <button @click="handleCropper">截取</button>
  <el-collapse style="width: 100%">
    <el-collapse-item title="配置" style="padding: 0 20px">
      <template #title>
        <span style="margin-right: 12px">配置</span>
        <el-button @click.stop="handleSave">保存配置</el-button>
        <el-button @click.stop="handleReset">还原配置</el-button>
      </template>
      <div style="font-size: 16px; margin-bottom: 6px">props</div>
      <el-form inline size="small">
        <el-form-item label="size">
          <el-input-number v-model="viewportProps.size" :min="0" />
        </el-form-item>
        <el-form-item label="width">
          <el-input-number v-model="viewportProps.width" :min="0" />
        </el-form-item>
        <el-form-item label="height">
          <el-input-number v-model="viewportProps.height" :min="0" />
        </el-form-item>
        <el-form-item label="view">
          <el-input-number v-model="viewportProps.view" :min="0" />
        </el-form-item>
        <el-form-item label="grid">
          <el-radio-group v-model="viewportProps.grid">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="step">
          <el-input-number v-model="viewportProps.step" :min="0" />
        </el-form-item>
        <el-form-item label="ctrlStep">
          <el-input-number v-model="viewportProps.ctrlStep" :min="0" />
        </el-form-item>
        <el-form-item label="shiftStep">
          <el-input-number v-model="viewportProps.shiftStep" :min="0" />
        </el-form-item>
        <el-form-item label="reverse">
          <el-radio-group v-model="viewportProps.reverse">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="mode">
          <el-select v-model="viewportProps.mode" style="width: 240px">
            <el-option label="fixed-view (观察窗固定)" value="fixed-view" />
            <el-option label="fixed-image (图片固定)" value="fixed-image" />
          </el-select>
        </el-form-item>
        <el-form-item label="minView">
          <el-input-number v-model="viewportProps.minView" :min="0" />
        </el-form-item>
        <el-form-item label="padding">
          <el-input-number v-model="viewportProps.padding" :min="0" />
        </el-form-item>
        <el-form-item label="arrow">
          <el-radio-group v-model="viewportProps.arrow">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="wasd">
          <el-radio-group v-model="viewportProps.wasd">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="mask">
          <el-select v-model="viewportProps.mask" style="width: 240px">
            <el-option label="clip-path" value="clip" />
            <el-option label="double layer" value="double" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="font-size: 16px; margin-bottom: 6px; margin-top: 30px">ImageSelectOptions</div>
      <el-form inline size="small">
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
      <div style="font-size: 16px; margin-bottom: 6px; margin-top: 30px">CropOptions</div>
      <el-form inline size="small">
        <el-form-item label="format">
          <el-select v-model="cropOptions.format" style="width: 240px">
            <el-option label="file" value="file" />
            <el-option label="base64" value="base64" />
          </el-select>
        </el-form-item>
        <el-form-item label="size">
          <el-input-number v-model="cropOptions.size" :min="0" clearable />
        </el-form-item>
        <el-form-item label="maxSize">
          <el-input-number v-model="cropOptions.maxSize" :min="0" clearable />
        </el-form-item>
        <el-form-item label="useOriginSize">
          <el-radio-group v-model="cropOptions.useOriginSize">
            <el-radio :value="true">true</el-radio>
            <el-radio :value="false">false</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="type">
          <el-select v-model="cropOptions.type" style="width: 240px">
            <el-option label="image/jpeg" value="image/jpeg" />
            <el-option label="image/png" value="image/png" />
            <el-option label="image/webp" value="image/webp" />
          </el-select>
        </el-form-item>
        <el-form-item label="quality">
          <el-input-number v-model="cropOptions.quality" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="filename">
          <el-input v-model="cropOptions.filename" clearable />
        </el-form-item>
        <el-form-item label="backgroundColor">
          <el-color-picker
            v-model="cropOptions.backgroundColor"
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
      <div style="font-size: 16px; margin-bottom: 6px; margin-top: 30px">Preview Props</div>
      <el-form inline>
        <el-form-item label="size">
          <el-input-number v-model="previewProps.size" :min="0" clearable />
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </el-collapse>
  <div style="display: flex; flex-direction: column; align-self: flex-start; padding: 0 20px 20px">
    <span style="font-size: 12px; margin: 0 0 4px 0">{{ imageInfoText }}</span>
    <img :src="src" alt="" style="width: fit-content" />
  </div>
</template>

<style lang="scss">
.preview {
  border: 1px solid yellow;
}
</style>
