<script setup>
import Guide1 from './guide1.vue'
import Guide2 from './guide2.vue'
import Guide3 from './guide3.vue'
</script>

# 快速开始

## 简介

vue-select-avatar 是一个基于 Vue3 的头像选择的库，它提供了一个头像选择器组件、一个预览组件和一些工具函数。相比上一个版本，仅提供一个函数，虽然更加便捷，但是自定义和扩展难度更高，现在这个版本仅提供核心组件/工具函数，它更加精简、低耦合。同时也在[快速使用](/usage)中提供使用案例，以供参考，可自行复制。

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

## 使用

### 基础使用

<Guide1 />

::: details 查看代码

<<< ./guide1.vue

:::

### 配合预览组件

<Guide2 />

::: details 查看代码

<<< ./guide2.vue

:::

### 图片固定模式

开启此模式后鼠标/触摸控制的就是观察窗，而不是图片

<Guide3 />

::: details 查看代码

<<< ./guide3.vue

:::

## Props

[Viewport Props](/options#viewport-props)

[Preview Props](/options#preview-props)

## Slots

Viewport Slots

| 插槽名               | 说明                     | 参数 |
| -------------------- | ------------------------ | ---- |
| `point-top-left`     | 图片固定模式下左上角的点 | -    |
| `point-top-right`    | 图片固定模式下右上角的点 | -    |
| `point-bottom-left`  | 图片固定模式下左下角的点 | -    |
| `point-bottom-right` | 图片固定模式下右下角的点 | -    |

Preview Slots

暂无

## Exposes

Viewport Exposes

| 名称           | 说明                                                 | 类型                                                           |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `select`       | 同 `import { selectImage } from 'vue-select-avatar'` | `import('vue-select-avatar')['selectImage']`                   |
| `cropper`      | 同 `import { cropper } from 'vue-select-avatar'`     | `import('vue-select-avatar')['cropper']`                       |
| `initPosition` | 初始化位置                                           | `(res: { file: File, width: number, height: number }) => void` |
