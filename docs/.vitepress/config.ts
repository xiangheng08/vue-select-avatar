import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import ElementPlus from 'unplugin-element-plus/vite'

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf-8'),
)

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: pkg.name,
  description: pkg.description,
  base: process.env.DOCS_BASE_URL,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '快速开始', link: '/guide' },
      { text: '快速使用', link: '/usage' },
      { text: '组件', link: '/components' },
      { text: 'API', link: '/api' },
      {
        text: '其他',
        items: [
          { text: 'CHANGELOG', link: '/CHANGELOG' },
          { text: '关于', link: '/about' },
        ],
      },
    ],
    sidebar: [
      { text: '快速开始', link: '/guide' },
      { text: '快速使用', link: '/usage' },
      { text: '组件', link: '/components' },
      { text: 'API', link: '/api' },
      { text: 'CHANGELOG', link: '/CHANGELOG' },
      { text: '关于', link: '/about' },
    ],
    socialLinks: [
      { icon: 'npm', link: 'https://www.npmjs.com/package/vue-select-avatar' },
      { icon: 'github', link: 'https://github.com/xiangheng08/vue-select-avatar' },
      { icon: 'gitee', link: 'https://gitee.com/xiangheng08/vue-select-avatar' },
    ],
    outline: {
      level: [2, 4],
    },
  },
  cleanUrls: true,
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    server: {
      port: 4578,
      host: '0.0.0.0',
    },
    plugins: [
      // @ts-expect-error 忽略类型错误
      groupIconVitePlugin(),
      // @ts-expect-error 忽略类型错误
      ElementPlus(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    ssr: {
      noExternal: ['element-plus'],
    },
    optimizeDeps: {
      exclude: ['vue-select-avatar'],
    },
  },
})
