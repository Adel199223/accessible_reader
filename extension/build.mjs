import { cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

import { build } from 'esbuild'


const rootDir = resolve(import.meta.dirname)
const distDir = resolve(rootDir, 'dist')

await rm(distDir, { force: true, recursive: true })
await mkdir(distDir, { recursive: true })

await build({
  bundle: true,
  entryPoints: {
    background: resolve(rootDir, 'src/background.ts'),
    content: resolve(rootDir, 'src/content.ts'),
    options: resolve(rootDir, 'src/options.ts'),
    popup: resolve(rootDir, 'src/popup.ts'),
  },
  format: 'esm',
  outdir: distDir,
  platform: 'browser',
  sourcemap: false,
  target: ['chrome120'],
})

await Promise.all([
  cp(resolve(rootDir, 'src/manifest.json'), resolve(distDir, 'manifest.json')),
  cp(resolve(rootDir, 'src/options.html'), resolve(distDir, 'options.html')),
  cp(resolve(rootDir, 'src/popup.html'), resolve(distDir, 'popup.html')),
  cp(resolve(rootDir, 'src/styles.css'), resolve(distDir, 'styles.css')),
])

