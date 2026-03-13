export interface ExtensionSettings {
  autoPrompt: boolean
  backendBaseUrl: string
  resultLimit: number
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  autoPrompt: true,
  backendBaseUrl: 'http://127.0.0.1:8000',
  resultLimit: 4,
}


export function clampResultLimit(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_SETTINGS.resultLimit
  }
  return Math.min(10, Math.max(1, Math.round(value)))
}


export function normalizeBackendBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')
  return trimmed || DEFAULT_SETTINGS.backendBaseUrl
}


export function mergeSettings(value: Partial<ExtensionSettings> | null | undefined): ExtensionSettings {
  return {
    autoPrompt: value?.autoPrompt ?? DEFAULT_SETTINGS.autoPrompt,
    backendBaseUrl: normalizeBackendBaseUrl(value?.backendBaseUrl ?? DEFAULT_SETTINGS.backendBaseUrl),
    resultLimit: clampResultLimit(value?.resultLimit ?? DEFAULT_SETTINGS.resultLimit),
  }
}


export async function loadSettings() {
  const stored = (await chrome.storage.sync.get(DEFAULT_SETTINGS)) as Partial<ExtensionSettings>
  return mergeSettings(stored)
}


export async function saveSettings(value: Partial<ExtensionSettings>) {
  const current = await loadSettings()
  const next = mergeSettings({ ...current, ...value })
  await chrome.storage.sync.set(next)
  return next
}


export async function ensureSettings() {
  const next = await loadSettings()
  await chrome.storage.sync.set(next)
  return next
}

