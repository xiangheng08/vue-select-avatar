// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import 'virtual:group-icons.css'

import ExampleHome1 from './components/example-home1.vue'
import ExampleHome2 from './components/example-home2.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app }) {
    app.component('ExampleHome1', ExampleHome1)
    app.component('ExampleHome2', ExampleHome2)
  },
} satisfies Theme
