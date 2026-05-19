<script setup>
import Guide1 from './components/guide1.vue'
import Guide2 from './components/guide2.vue'
import Guide3 from './components/guide3.vue'
import Guide4 from './components/guide4.vue'
</script>

# 快速开始

## 简介

vue-select-avatar 是一个基于 Vue3 的头像选择的库，它提供了一个头像选择器组件、一个预览组件和一些工具函数。相比上一个版本，仅提供一个函数，虽然更加便捷，但是自定义和扩展难度更高，现在这个版本仅提供核心组件/工具函数，它更加精简、低耦合。同时也在[快速使用](/usage)中提供使用案例，以供参考，可自行复制。

本库将头像裁剪流程拆分为三个独立环节，降低耦合度，提高灵活性：

- **选择图片**：通过 [`selectImage`](/api#selectimage) 函数从用户设备选择并验证图片
- **控制裁剪区域**：使用 [`<Viewport/>`](/components#viewport) 组件交互式地调整裁剪区域
- **图片截取**：调用 [`<Viewport/>`](/components#viewport-exposes) 暴露的 `crop` 方法，通过 [`CropOptions`](/api#cropoptions) 配置输出最终图片

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

::: warning
3.0+ 版本仅支持 Vue 3.x，Vue 2.x 用户请使用 vue-select-avatar@2.x
:::

## 使用

### 基础使用

```vue
<Viewport grid />
```

<ClientOnly>
  <Guide1 />
</ClientOnly>

::: details 查看完整代码

<<< ./components/guide1.vue

:::

### 配合预览组件

通过 `ref` 将 `<Viewport/>` 实例传递给 `<Preview/>` 组件，实现实时预览裁剪效果。

```vue
<script setup lang="ts">
import { Viewport, Preview, type ViewportInstance } from 'vue-select-avatar'

const viewportRef = ref<ViewportInstance>()
</script>

<template>
  <Viewport ref="viewportRef" grid />
  <Preview :viewportRef bg="#252526" />
</template>
```

<ClientOnly>
  <Guide2 />
</ClientOnly>

::: details 查看完整代码

<<< ./components/guide2.vue

:::

### 图片固定模式

设置 `mode="fixed-image"` 开启图片固定模式，此模式下鼠标/触摸控制的就是观察窗，而不是图片。

在这种模式下，用户可以通过拖动四角的控制点来调整裁剪区域的大小，适合需要精确控制裁剪范围的场景。

```vue
<Viewport mode="fixed-image" />
```

<ClientOnly>
  <Guide3 />
</ClientOnly>

::: details 查看完整代码

<<< ./components/guide3.vue

:::

### 两种移动模式详解

`<Viewport/>` 组件提供两种移动模式，通过 [`mode`](/components#viewport-props) 属性控制：

**`mode="fixed-view"`（默认）**

- 观察窗口固定，鼠标/触摸拖动的是图片
- 适合大多数场景，操作直观
- 滚轮缩放时，以鼠标中心为基准

**`mode="fixed-image"`**

- 图片固定，鼠标/触摸拖动的是观察窗口
- 可以通过四角控制点调整观察窗口大小
- 适合需要精确控制裁剪范围的场景
- 配合 `minView` 和 `padding` 属性使用效果更佳

### 先选择图片再截取

使用 [`selectImage`](/api#selectimage) 选择完图片后，再通过 `info` prop 传入 `Viewport` 组件。

这种方式将图片选择和裁剪分离，可以在选择图片后进行额外的处理或验证，然后再显示裁剪界面。

```vue
<script setup lang="ts">
import {
  Viewport,
  AvatarError,
  selectImage,
  type ViewportInstance,
  type ImageInfo,
} from 'vue-select-avatar'

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const viewportRef = ref<ViewportInstance>()
const info = ref<ImageInfo>()

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
</script>

<template>
  <Viewport v-if="info" ref="viewportRef" grid :info="info" />
</template>
```

<ClientOnly>
  <Guide4 />
</ClientOnly>

::: details 查看完整代码

<<< ./components/guide4.vue

:::

::: info

本库提供两种选择图片的方式：

1. 组件暴露的 [`select`](/components#viewport-exposes) 方法（通过 `<Viewport/>` 实例调用）
2. 独立提供的 [`selectImage`](/api#selectimage) 方法

**推荐使用 `selectImage` 方法**，因为：

- 自定义程度更高，可以在选择前后进行任意处理
- 无需等待 `<Viewport/>` 组件实例化，使用更灵活

:::

### 自适应容器尺寸

`<Viewport/>` 组件的 `size`、`width`、`height` 属性支持设置为 `'full'`，使组件填充满父容器。

```vue
<template>
  <div style="width: 400px; height: 300px;">
    <!-- 填充整个容器 (400x300) -->
    <Viewport size="full" />

    <!-- 宽度固定，高度填充整个容器 -->
    <Viewport :width="320" height="full" />
  </div>
</template>
```

`<Preview/>` 组件的 `size` 属性也支持设置为 `'full'`。当 `size="full"` 时，如果父容器的宽高不一致，将使用**较小的那个值**作为正方形的尺寸，确保预览图为正方形。

```vue
<template>
  <div style="width: 400px; height: 300px;">
    <!-- 会使用较小值 300px 作为正方形尺寸 -->
    <Preview size="full" />
  </div>
</template>
```

### 键盘快捷键操作

`<Viewport/>` 组件支持丰富的键盘快捷键，提升操作效率：

**移动操作**

- **方向键**：上下左右移动图片/观察窗（默认开启，可通过 [`arrow`](/components#viewport-props) 属性关闭）
- **WASD 键**：W上、A左、S下、D右移动（默认开启，可通过 [`wasd`](/components#viewport-props) 属性关闭）

**缩放操作**

- **滚轮**：正常速度缩放（步长由 [`step`](/components#viewport-props) 控制，默认 0.05）
- **Ctrl + 滚轮**：精细缩放（步长由 [`ctrlStep`](/components#viewport-props) 控制，默认 0.02）
- **Shift + 滚轮**：快速缩放（步长由 [`shiftStep`](/components#viewport-props) 控制，默认 2）

所有步长值 `<1` 表示比例，`>=1` 表示像素值。将步长设置为 `0` 可禁用对应的快捷键。

**提示**：当步长为数值时（`>=1`），建议设置为 **2 的倍数**（如 2、4、8、16），这样可以避免裁剪时出现小数像素，保证输出图片尺寸的准确性。

### 遮罩实现方式

`<Viewport/>` 提供两种遮罩实现方式，通过 [`mask`](/components#viewport-props) 属性控制：

- **`mask="clip"`（默认）**：使用 CSS `clip-path` 实现遮罩，性能更好
- **`mask="double"`**：使用双层图片叠加实现遮罩，兼容性更好

**自动降级机制**：即使设置 `mask="clip"`，如果浏览器不支持 `clip-path`，也会自动降级到双层图片模式，确保功能正常。

### 观察窗配置

通过 [`view`](/components#viewport-props) 属性控制观察窗口的大小：

```vue
<template>
  <!-- 观察窗为视口较小边的 60% -->
  <Viewport :view="0.6" />

  <!-- 观察窗固定为 200px -->
  <Viewport :view="200" />
</template>
```

**说明**：

- 当 `view <= 1` 时，表示**比例**，基于 `<Viewport/>` 宽高中**较小的那个值**计算
- 当 `view > 1` 时，表示**像素值**，直接使用指定的像素大小
- 默认值为 `0.6`（即视口较小边的 60%）

### 网格背景

启用 [`grid`](/components#viewport-props) 属性可以显示透明网格背景，方便查看透明图片：

<ClientOnly>
<div style="display: flex; gap: 20px; align-items: flex-start;">
  <div>
    <p style="text-align: center; margin-bottom: 8px;">关闭 grid</p>
    <Viewport :size="150" />
  </div>
  <div>
    <p style="text-align: center; margin-bottom: 8px;">开启 grid</p>
    <Viewport :size="150" grid />
  </div>
</div>
</ClientOnly>

网格背景对于处理 PNG 等透明格式的图片特别有用，可以清晰看到透明区域。

### 滚动反向

通过 [`reverse`](/components#viewport-props) 属性可以反转滚轮缩放方向：

```vue
<template>
  <!-- 默认：向上滚动放大，向下滚动缩小 -->
  <Viewport />

  <!-- 反向：向上滚动缩小，向下滚动放大 -->
  <Viewport reverse />
</template>
```

**提示**：macOS 系统的触控板/鼠标滚轮方向与 Windows 相反，如果主要面向 mac 用户，建议开启 `reverse` 以获得更自然的操作体验。

### 自定义控制点样式

在 `mode="fixed-image"` 模式下，可以通过插槽自定义四个角的控制点样式：

```vue
<template>
  <Viewport mode="fixed-image">
    <template #point-top-left>
      <div class="custom-point">↖</div>
    </template>
    <template #point-top-right>
      <div class="custom-point">↗</div>
    </template>
    <template #point-bottom-left>
      <div class="custom-point">↙</div>
    </template>
    <template #point-bottom-right>
      <div class="custom-point">↘</div>
    </template>
  </Viewport>
</template>

<style scoped>
.custom-point {
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}
</style>
```

可用的插槽：

- `point-top-left`：左上角控制点
- `point-top-right`：右上角控制点
- `point-bottom-left`：左下角控制点
- `point-bottom-right`：右下角控制点

### Preview 组件的圆形模式

`<Preview/>` 组件支持圆形预览，通过 `round` 属性启用：

```vue
<template>
  <!-- 方形预览（默认） -->
  <Preview :viewport-ref="viewportRef" />

  <!-- 圆形预览 -->
  <Preview :viewport-ref="viewportRef" round />

  <!-- 圆形预览 + 自定义背景色 -->
  <Preview :viewport-ref="viewportRef" round bg="#f0f0f0" />
</template>
```

还可以通过 `bg` 属性设置预览区域的背景颜色，默认为透明。

### CSS 变量自定义

`<Viewport/>` 组件支持通过 CSS 变量自定义样式：

```vue
<template>
  <Viewport
    :border="2"
    style="
      --line-color: #409eff;
      --point-size: 12px;
      --mask-color: rgba(0, 0, 0, 0.6);
      --bg-color: #1a1a1a;
    "
  />
</template>
```

可用的 CSS 变量：

- `--line-color`：线条和控制点边框颜色（默认 `#fff`）
- `--point-size`：控制点大小（默认 `10px`）
- `--mask-color`：遮罩层颜色（默认 `rgba(0, 0, 0, 0.5)`）
- `--bg-color`：背景颜色（默认 `#000`）
- `--border-width`：边框宽度（默认 `1px`）

**注意事项**：

1. **边框宽度**：建议通过 `border` prop 控制边框宽度，而不是直接设置 `--border-width`，这样可以确保边框逻辑正确应用
2. **控制点大小**：`--point-size` 建议与 `padding` 属性保持一致，避免控制点与视口边缘重叠或间距过大

```vue
<template>
  <!-- 推荐做法 -->
  <Viewport :border="2" :padding="12" style="--point-size: 12px;" />
</template>
```

## 错误处理

`vue-select-avatar` 使用 `AvatarError` 类来处理错误情况。

```ts
import { AvatarError } from 'vue-select-avatar'
```

- `AvatarError.is(value)`: 判断错误是否为 AvatarError 实例
- `AvatarError.isCancel(value)`: 判断错误是否为取消错误

```ts
import { AvatarError, selectImage } from 'vue-select-avatar'

import { ElMessage } from 'element-plus'

selectImage().catch((err) => {
  // 取消
  if (AvatarError.isCancel(err)) return
  // 错误处理
  console.error(err)
  ElMessage.error(AvatarError.is(err) ? err.message : String(err))
})
```

### 多语言支持

库内置了中文和英文两种语言支持，默认使用中文。可以通过 `setLocale` 函数切换语言：

```ts
import { setLocale, en } from 'vue-select-avatar'

// 切换到英文
setLocale(en)
```

### 自定义错误信息

如果需要自定义错误信息，可以创建自己的 locale 对象：

```ts
import { setLocale } from 'vue-select-avatar'
import type { Locale } from 'vue-select-avatar'

const customLocale: Locale = {
  UNKNOWN: '未知错误',
  CANCEL: '用户取消操作',
  NOT_IMAGE_FILES: '所选文件不是图片',
  IMAGE_FILE_TOO_LARGE: '图片文件太大',
  IMAGE_TOO_SMALL: '图片尺寸太小',
  IMAGE_TOO_LARGE: '图片尺寸太大',
  IMAGE_LOAD_FAILED: '图片加载失败',
  CANVAS_TO_BLOB_FAILED: 'Canvas转换为Blob失败',
  BLOB_TO_BASE64_FAILED: 'Blob转换为Base64失败',
  CANVAS_CONTEXT_NOT_DEFINED: 'Canvas上下文未定义',
  NO_IMAGE_SELECTED: '未选择图片',
}

setLocale(customLocale)
```

完整的错误码列表：

<<< ../lib/types.ts#ErrorCode

## 注意事项

1. `<Preview />` 组件的根元素请勿设置 `box-sizing: border-box;`，否则会导致位置偏差
