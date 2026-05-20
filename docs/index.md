---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: vue-select-avatar
  text: 一个头像集选择/裁剪的组件库
  tagline: 或者说输出一个正方形图片的库
  actions:
    - theme: brand
      text: 快速开始
      link: /guide
    - theme: alt
      text: 组件
      link: /components
  image:
    src: /demo-compress.gif
    alt: demo

features:
  - title: ✂️ 精准头像裁剪
    details: 通过拖拽/缩放精确控制1:1比例裁剪，自动吸附边缘对齐，支持触控设备双指操作，输出标准正方形图片
  - title: 🖱️ 丰富的交互功能
    details: 提供多种交互模式（固定图片或固定观察窗），支持鼠标拖拽、滚轮缩放、键盘快捷键移动，以及触摸设备的单指拖动和双指缩放操作，实时预览裁剪效果
  - title: 🚀 纯 Vue3 核心依赖
    details: 仅依赖 Vue3，无其他生产环境依赖项，TypeScript 类型全面，核心代码小于 40KB
---

## 安装

::: code-group

```bash [npm]
npm i vue-select-avatar
```

```bash [pnpm]
pnpm add vue-select-avatar
```

```bash [yarn]
yarn add vue-select-avatar
```

:::

## 快速体验

<ClientOnly>
  <ExampleHome1 />
</ClientOnly>

<ClientOnly>
  <ExampleHome2 />
</ClientOnly>

<script setup>
import PreviewWechatQRCode from "./components/previews/PreviewWechatQRCode.vue";
</script>

<ClientOnly>
<PreviewWechatQRCode />
</ClientOnly>
