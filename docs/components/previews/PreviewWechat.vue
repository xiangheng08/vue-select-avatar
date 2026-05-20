<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { AvatarError, selectImage, Viewport } from 'vue-select-avatar'
import type { ImageInfo, ViewportInstance } from 'vue-select-avatar'

const viewportRef = ref<ViewportInstance>()
const info = ref<ImageInfo>()
const src = ref('')
const pageUrl = location.href

const handleSelect = async () => {
  try {
    const res = await selectImage({ maxFileSize: 20 * 1024 * 1024 })
    info.value = res
  } catch (error) {
    // 忽略取消错误
    if (AvatarError.isCancel(error)) return
    // 错误处理
    console.error(error)
    ElMessage.error(error instanceof Error ? error.message : String(error))
  }
}

const handleCrop = () => {
  viewportRef.value?.crop<string>({ format: 'base64' }).then((res) => {
    src.value = res
  })
}

const handleClear = () => {
  src.value = ''
  info.value = void 0
}
</script>

<template>
  <div class="preview-wechat">
    <template v-if="src">
      <img :src="src" alt="" />
      <button class="select-button crop-button" @click="handleClear">清除</button>
    </template>
    <template v-else-if="info">
      <Viewport ref="viewportRef" size="full" :info="info" />
      <button class="select-button crop-button" @click="handleCrop">确定</button>
    </template>
    <div v-else class="select-container">
      <button class="select-button" @click="handleSelect">选择图片</button>

      <div class="qrcode-container">
        <xh-qrcode class="qrcode" :value="pageUrl"></xh-qrcode>
        <p>扫码在其他设备上查看此页面</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.preview-wechat {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .select-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .select-button {
    font-size: 16px;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #07c160;
    color: #fff;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #06ad56;
    }
  }

  .qrcode-container {
    margin-top: 16px;
    width: 132px;
    background-color: #fff;

    p {
      padding: 2px 8px 8px;
      text-align: center;
      color: #999;
      font-size: 12px;
      line-height: 1.5;
    }
  }

  .crop-button {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
</style>

<style lang="scss">
.VPContent:has(.preview-wechat) {
  position: relative;
}
.VPPage:has(.preview-wechat) {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;

  > div {
    width: 100%;
    height: 100%;
    > div {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
