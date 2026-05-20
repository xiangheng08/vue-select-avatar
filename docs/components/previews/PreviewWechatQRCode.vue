<script setup lang="ts">
import { withBase } from 'vitepress'
const url = location.origin + withBase('/preview-wechat')
</script>

<template>
  <div align="center" style="margin-top: 60px">
    <div style="background-color: #fff; width: 132px">
      <xh-qrcode :value="url"></xh-qrcode>
      <p class="qrcode-tips">扫描二维码体验仿微信头像裁剪</p>
    </div>
    <a :href="withBase('/preview-wechat')">立即体验</a>
  </div>
</template>

<style lang="scss" scoped>
.qrcode-tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin: 0;
  padding: 2px 8px 8px;
  line-height: 1.5;
}
</style>
