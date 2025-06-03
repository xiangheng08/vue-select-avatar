import { copyFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dtsPath = resolve(__dirname, '../dist/index.d.ts')
const esPath = resolve(dirname(dtsPath), 'es.d.ts')
const umdPath = resolve(dirname(dtsPath), 'umd.d.ts')

const main = async () => {
  // 复制 .d.ts 文件到 es.d.ts 和 umd.d.ts
  // 保证导入时类型完整
  await copyFile(dtsPath, esPath)
  await copyFile(dtsPath, umdPath)
}

main()
