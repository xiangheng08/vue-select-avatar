# CHANGELOG

## 3.0.0-alpha.5

1. `ImageSelectOptions` 增加 `minVectorSize` 属性。选择的图片因为最终会转成 `png` 格式，而某些矢量图没有设置宽高，就会按照 `img` 元素的默认尺寸进行缩放，可能导致图片过小，有模糊感，增加这个属性，保证矢量图尺寸不会过小
2. 修复选择 `svg` 图片时，图片加载失败

## 3.0.0-alpha.3

1. `Viewport` 组件添加 `forceDoubleLayer` 属性

## 3.0.0-alpha.2

1. 增加错误处理函数和错误信息
2. 优化 `lib/utils.ts`
3. 更新文档
