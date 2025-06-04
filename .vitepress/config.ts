import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vue-select-avatar',
  description: '一个基于 Vue3 的头像选择的库',
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide' },
      { text: '快速使用', link: '/usage' },
      { text: 'OPTIONS', link: '/options' },
    ],

    sidebar: [
      { text: '快速开始', link: '/guide' },
      { text: '快速使用', link: '/usage' },
      { text: 'OPTIONS', link: '/options' },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
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
      // @ts-ignore vitepress 所依赖的 vite 与本项目的 vite 版本不兼容，但是可用，所以忽略
      groupIconVitePlugin(),
      // @ts-ignore
      ElementPlus(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
})
