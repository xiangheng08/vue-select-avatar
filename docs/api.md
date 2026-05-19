# API

这里列出了 vue-select-avatar 提供的所有 JavaScript API，均提供完整的 TypeScript 类型定义，支持智能提示和类型检查。

## `selectImage`

从用户设备选择图片文件并进行验证和处理。

**类型签名：**

```ts
function selectImage(options?: ImageSelectOptions): Promise<ImageSelectResult>
```

**使用示例：**

```ts
import { selectImage } from 'vue-select-avatar'

const result = await selectImage({
  accept: 'image/jpeg, image/png',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  compress: true,
  quality: 0.8,
})

console.log('选择的文件:', result.file)
console.log('图片尺寸:', result.width, 'x', result.height)
```

### `ImageSelectOptions`

<<< ../lib/types.ts#ImageSelectOptions

### `ImageSelectResult`

<<< ../lib/types.ts#ImageSelectResult

## `selectFile`

选择文件而不进行图片验证和处理。

**类型签名：**

```ts
function selectFile(options?: SelectFileOptions): Promise<File[]>
```

**使用示例：**

```ts
import { selectFile } from 'vue-select-avatar'

const files = await selectFile({
  accept: '.jpg,.png,.gif',
  multiple: true,
})

console.log('选择的文件数量:', files.length)
```

## `loadImage`

加载图片并返回 HTMLImageElement 对象。

**类型签名：**

```ts
function loadImage(url: string, revoke?: boolean): Promise<HTMLImageElement>
```

**使用示例：**

```ts
import { loadImage } from 'vue-select-avatar'

const img = await loadImage('https://example.com/image.jpg')
console.log('图片尺寸:', img.width, 'x', img.height)
```

**参数：**

| 参数     | 类型      | 默认值  | 描述                            |
| -------- | --------- | ------- | ------------------------------- |
| `url`    | `string`  | -       | 图片 URL                        |
| `revoke` | `boolean` | `false` | 是否在加载完成后撤销 Object URL |

## `canvasToBlob`

将 Canvas 元素转换为 Blob 对象。

**类型签名：**

```ts
function canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob>
```

**使用示例：**

```ts
import { canvasToBlob } from 'vue-select-avatar'

const canvas = document.createElement('canvas')
// ... 绘制内容到 canvas ...

const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9)
console.log('Blob 大小:', blob.size, 'bytes')
```

**参数：**

| 参数      | 类型                | 默认值        | 描述                                                               |
| --------- | ------------------- | ------------- | ------------------------------------------------------------------ |
| `canvas`  | `HTMLCanvasElement` | -             | Canvas 元素                                                        |
| `type`    | `string`            | `'image/png'` | MIME 类型                                                          |
| `quality` | `number`            | -             | 图片质量（0-1），仅对有损压缩格式（如 image/jpeg、image/webp）有效 |

## `blobToBase64`

将 Blob 对象转换为 Base64 字符串。

**类型签名：**

```ts
function blobToBase64(blob: Blob): Promise<string>
```

**使用示例：**

```ts
import { blobToBase64 } from 'vue-select-avatar'

const base64 = await blobToBase64(blob)
console.log('Base64 字符串长度:', base64.length)
```

## 常量

### `DEFAULT_ACCEPT`

默认接受的文件类型。

```ts
const DEFAULT_ACCEPT =
  'image/jpeg, image/png, image/webp, image/bmp, image/svg+xml, image/avif, image/tiff'
```

## 类型定义

### `ViewportInstance`

<<< ../lib/types.ts#ViewportInstance

### `ImageSelectResult`

<<< ../lib/types.ts#ImageSelectResult

### `ImageSelectOptions`

<<< ../lib/types.ts#ImageSelectOptions

### `CropOptions`

<<< ../lib/types.ts#CropOptions

### `Position`

<<< ../lib/types.ts#Position

### `ErrorCode`

<<< ../lib/types.ts#ErrorCode
