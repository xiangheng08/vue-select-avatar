# vue-select-avatar

基于 Vue 3 的头像选择与裁剪组件，支持图片校验、压缩和格式转换。

![demo.gif](https://xiangheng08.github.io/vue-select-avatar/demo.gif)

<br />

![style_1.png](https://raw.githubusercontent.com/xiangheng08/vue-select-avatar/refs/heads/v3/static/style_1.png)
![style_2.png](https://raw.githubusercontent.com/xiangheng08/vue-select-avatar/refs/heads/v3/static/style_2.png)

## 功能特性

- 🖼️ 图片格式校验与尺寸限制
- 📏 自动缩放超大图片
- ⚡ 内置图片压缩功能
- ✂️ 可视化区域裁剪
- 📤 支持输出文件或Base64格式
- 🎨 可配置JPEG背景色

## 安装

```sh
npm i vue-select-avatar
```

## 文档

[开发文档](https://xiangheng08.github.io/vue-select-avatar/)

```vue
<script setup lang="ts">
import 'vue-select-avatar/style.css'
import { Viewport } from 'vue-select-avatar'

import { ref } from 'vue'

const viewportRef = ref<InstanceType<typeof Viewport>>()

const handleSelect = () => {
  viewportRef.value
    ?.select({
      // options...
    })
    .catch((err) => {
      if (err instanceof Error && err.message === 'CANCEL') {
        return
      }
    })
}

const handleCropper = async () => {
  const file = await viewportRef.value?.cropper({
    // options...
  })
  if (file instanceof File) {
    console.log(file.size, file)
  }
}
</script>

<template>
  <button @click="handleSelect">选择图片</button>
  <button @click="handleCropper">截取图片</button>
  <Viewport grid ref="viewportRef" />
</template>
```

## 开发

```sh
git clone https://github.com/xiangheng08/vue-select-avatar.git
cd vue-select-avatar
pnpm i
pnpm dev # 启动开发服务
pnpm build # 构建项目
pnpm docs:dev # 启动文档开发服务（请先运行 pnpm build）
pnpm docs:build # 构建文档
```

## License

[MIT](https://github.com/xiangheng08/vue-select-avatar/blob/HEAD/LICENSE)
