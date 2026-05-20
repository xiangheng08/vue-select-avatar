// https://vitepress.dev/guide/custom-theme
import { h, watchEffect } from 'vue'
import { useData } from 'vitepress'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import 'virtual:group-icons.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import ExampleHome1 from './components/example-home1.vue'
import ExampleHome2 from './components/example-home2.vue'
import { Viewport, Preview } from 'vue-select-avatar'

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark } = useData()

    const _document = globalThis.document

    // element-plus dark mode
    watchEffect(() => {
      if (isDark.value) {
        _document?.documentElement.classList.add('dark')
      } else {
        _document?.documentElement.classList.remove('dark')
      }
    })

    onMounted(() => {
      import('@xiangheng08/qrcode')
    })

    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app }) {
    app.component('ExampleHome1', ExampleHome1)
    app.component('ExampleHome2', ExampleHome2)
    app.component('Viewport', Viewport)
    app.component('Preview', Preview)
  },
} satisfies Theme
