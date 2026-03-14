import { cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

import { build } from 'esbuild'


const rootDir = resolve(import.meta.dirname)
const debugBuild = process.argv.includes('--debug')
const distDir = resolve(rootDir, debugBuild ? 'dist-debug' : 'dist')

await rm(distDir, { force: true, recursive: true })
await mkdir(distDir, { recursive: true })

await build({
  banner: {
    js: `globalThis.__RECALL_EXTENSION_DEBUG__ = ${debugBuild ? 'true' : 'false'};`,
  },
  bundle: true,
  entryPoints: {
    background: resolve(rootDir, 'src/background.ts'),
    content: resolve(rootDir, 'src/content.ts'),
    ...(debugBuild ? { debug: resolve(rootDir, 'src/debug.ts') } : {}),
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
  ...(debugBuild ? [cp(resolve(rootDir, 'src/debug.html'), resolve(distDir, 'debug.html'))] : []),
  cp(resolve(rootDir, 'src/options.html'), resolve(distDir, 'options.html')),
  cp(resolve(rootDir, 'src/popup.html'), resolve(distDir, 'popup.html')),
  cp(resolve(rootDir, 'src/styles.css'), resolve(distDir, 'styles.css')),
])
