# OPTIONS

## Viewport Props

| 属性               | 说明                                      | 类型                                            | 默认值  |
| ------------------ | ----------------------------------------- | ----------------------------------------------- | ------- |
| `size`             | 视口尺寸                                  | `number`                                        | `300`   |
| `width`            | 视口宽度（覆盖`size`）                    | `number`                                        | -       |
| `height`           | 视口高度（覆盖`size`）                    | `number`                                        | -       |
| `info`             | 图片信息                                  | `{ file: File, width: number, height: number }` | -       |
| `viewSize`         | 观察窗口大小                              | `number`                                        | `180`   |
| `grid`             | 是否为网格背景                            | `boolean`                                       | `false` |
| `scaleStep`        | 缩放步长，单位px                          | `number`                                        | `10`    |
| `ctrlScaleStep`    | Ctrl键缩放步长，单位px（0时禁用）         | `number`                                        | `5`     |
| `shiftScaleStep`   | Shift键缩放步长，单位px（0时禁用）        | `number`                                        | `1`     |
| `wheelReverse`     | 滚轮反向                                  | `boolean`                                       | `false` |
| `fixedImage`       | 图片固定模式                              | `boolean`                                       | `false` |
| `minViewSize`      | 最小观察窗口尺寸                          | `number`                                        | `10`    |
| `imagePadding`     | 图片边距                                  | `number`                                        | `10`    |
| `directionKey`     | 方向键移动                                | `boolean`                                       | `true`  |
| `wasdKey`          | WASD键移动                                | `boolean`                                       | `true`  |
| `forceDoubleLayer` | 强制使用双层DOM（图片固定模式下建议开启） | `boolean`                                       | `false` |

## Preview Props

| 属性          | 说明               | 类型                            | 默认值  |
| ------------- | ------------------ | ------------------------------- | ------- |
| `size`        | 预览窗口尺寸       | `number`                        | `180`   |
| `viewportRef` | 关联的视口组件实例 | `InstanceType<typeof Viewport>` | -       |
| `round`       | 是否显示圆形预览   | `boolean`                       | `false` |
| `bg`          | 预览区域背景色     | `string`                        | -       |

## ImageSelect Options

| 属性          | 说明                                                                 | 类型              | 默认值          |
| ------------- | -------------------------------------------------------------------- | ----------------- | --------------- |
| `accept`      | 允许的文件类型（参考 input 的 accept 属性）                          | `string`          | `image/*`       |
| `maxFileSize` | 最大文件大小（单位：字节）                                           | `number`          | `2097152` (2MB) |
| `minSize`     | 图片最小尺寸（宽高任一小于该值时抛出错误）                           | `number`          | -               |
| `maxSize`     | 图片最大尺寸（宽高任一超过该值时缩放或抛错）                         | `number`          | `5000`          |
| `resizeToMax` | 超过最大尺寸时是否等比例缩放到最大尺寸                               | `boolean`         | `false`         |
| `compress`    | 压缩策略：<br/>- `true`：全部压缩<br/>- `number`：文件大于该值时压缩 | `boolean｜number` | `false`         |
| `quality`     | 压缩质量（0-1）                                                      | `number`          | `0.8`           |

## Cropper Options

| 属性              | 说明                               | 类型               | 默认值        |
| ----------------- | ---------------------------------- | ------------------ | ------------- |
| `format`          | 输出数据格式                       | `'file'｜'base64'` | `'file'`      |
| `size`            | 输出图片尺寸（优先于 maxSize）     | `number`           | -             |
| `maxSize`         | 最大输出尺寸（超过时等比例缩放）   | `number`           | -             |
| `useOriginSize`   | 当截取尺寸小于输出尺寸时使用原尺寸 | `boolean`          | `true`        |
| `type`            | 输出图片类型                       | `string`           | `'image/png'` |
| `quality`         | 输出质量（0-1）                    | `number`           | `1`           |
| `filename`        | 输出文件名（仅 file 格式有效）     | `string`           | 原文件名      |
| `backgroundColor` | JPEG 格式的填充背景色              | `string`           | `'#ffffff'`   |
