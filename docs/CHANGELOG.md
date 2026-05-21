# CHANGELOG

## v3.0.0-alpha.8

1. 修复 info prop 变化时没有更新视图

## v3.0.0-alpha.7

1. `<Viewport/>` 组件新增 `border` prop，控制是否显示观察窗边框
2. `ViewportProps.size`、`ViewportProps.width`、`ViewportProps.height` 及 `PreviewProps.size` 新增支持 `full` 关键字，设置后将自动填满容器
3. `<Viewport/>` 组件去除 `shadowMask` prop（内阴影不适用于非正方形）
4. 全面使用 rolldown 和 oxc 生态，升级 vite 至 8.0
5. 重构并优化代码
6. 全面优化文档

## v3.0.0-alpha.5

1. `ImageSelectOptions` 增加 `minVectorSize` 属性。选择的图片因为最终会转成 png 格式，而某些矢量图没有设置宽高，就会按照 img 元素的默认尺寸进行缩放，可能导致图片过小，有模糊感，增加这个属性，保证矢量图尺寸不会过小
2. 修复选择 svg 图片时，图片加载失败

## v3.0.0-alpha.4

测试 Publish Package to npmjs

## 3.0.0-alpha.3

1. `Viewport` 组件添加 `forceDoubleLayer` 属性

## 3.0.0-alpha.2

1. 增加错误处理函数和错误信息
2. 优化 `lib/utils.ts`
3. 更新文档
