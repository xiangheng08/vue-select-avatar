import { dirname, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'lib/index.ts'),
        errorMessage_en: resolve(__dirname, 'lib/errorMessage_en.ts'),
      },
      name: 'vue-select-avatar',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖
        // 提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
  },
  plugins: [vue(), vueDevTools(), dts({ tsconfigPath: './tsconfig.types.json' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
