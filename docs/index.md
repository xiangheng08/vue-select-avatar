---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: vue-select-avatar
  text: 一个基于 Vue3 的头像选择的库
  tagline: 或者说输出一个正方形图片的库
  actions:
    - theme: brand
      text: 快速开始
      link: /guide
    - theme: alt
      text: OPTIONS
      link: /options
    - theme: alt
      text: 关于
      link: /about
  image:
    src: /demo-compress.gif
    alt: demo

features:
  - title: 精准头像裁剪
    details: 通过拖拽/缩放精确控制1:1比例裁剪框，自动吸附边缘对齐，支持触控设备双指操作，输出标准正方形图片
  - title: 原生 DOM 实时预览
    details: 基于 Vue3 Composition API 实现的双层 DOM 结构，通过 CSS transform 实时渲染，包含网格线辅助、放大镜悬浮预览和透明背景遮罩功能
  - title: 纯 Vue3 核心依赖
    details: 仅依赖 Vue3，无其他生产环境依赖项，支持 TypeScript 类型，核心代码小于 40KB
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
