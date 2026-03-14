declare global {
  var __RECALL_EXTENSION_DEBUG__: boolean | undefined
}

export const RECALL_EXTENSION_DEBUG = globalThis.__RECALL_EXTENSION_DEBUG__ ?? false
