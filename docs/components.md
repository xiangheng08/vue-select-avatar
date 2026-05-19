# 组件

vue-select-avatar 提供了两个核心组件：`<Viewport/>`（视口裁剪组件）和 `<Preview/>`（预览组件）。

## `<Viewport/>`

视口裁剪组件，用于显示图片并提供裁剪交互功能。

### 基本示例 {#viewport-example}

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Viewport } from 'vue-select-avatar'

const viewportRef = ref()

const handleCrop = async () => {
  const file = await viewportRef.value.crop({
    size: 200,
    type: 'image/jpeg',
    quality: 0.9,
  })
  console.log('裁剪后的文件:', file)
}
</script>

<template>
  <Viewport ref="viewportRef" />
  <button @click="handleCrop">裁剪</button>
</template>
```

### Props {#viewport-props}

<<< ../lib/types.ts#ViewportProps

### Slots {#viewport-slots}

| 插槽名称             | 描述                                                       |
| -------------------- | ---------------------------------------------------------- |
| `point-top-left`     | 左上角控制点自定义内容（仅在 `mode='fixed-image'` 时生效） |
| `point-top-right`    | 右上角控制点自定义内容（仅在 `mode='fixed-image'` 时生效） |
| `point-bottom-left`  | 左下角控制点自定义内容（仅在 `mode='fixed-image'` 时生效） |
| `point-bottom-right` | 右下角控制点自定义内容（仅在 `mode='fixed-image'` 时生效） |

### Exposes {#viewport-exposes}

<<< ../lib/types.ts#ViewportExposes

## `<Preview/>`

预览组件，用于实时显示裁剪效果。需要与 `Viewport` 组件配合使用。

### 基本示例 {#preview-example}

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Viewport, Preview } from 'vue-select-avatar'

const viewportRef = ref()
</script>

<template>
  <Viewport ref="viewportRef" />
  <Preview :viewport-ref="viewportRef" round />
</template>
```

### Props {#preview-props}

<<< ../lib/types.ts#PreviewProps

### Slots {#preview-slots}

Preview 组件不提供插槽。

### Exposes {#preview-exposes}

Preview 组件不提供暴露的方法。
