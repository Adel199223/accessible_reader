import type { BrowserContextResponse } from './contracts'
import type { ExtensionSettings } from './settings'


export function shouldShowPrompt(
  response: BrowserContextResponse | null,
  settings: ExtensionSettings,
  dismissedFingerprints: string[],
) {
  if (!response || !settings.autoPrompt) {
    return false
  }
  if (!response.should_prompt || response.hits.length === 0) {
    return false
  }
  return !dismissedFingerprints.includes(response.page_fingerprint)
}


export function buildPromptLabel(response: BrowserContextResponse | null) {
  if (!response) {
    return 'Recall is checking this page.'
  }
  if (response.summary && response.summary !== 'Recall stayed quiet on this page.') {
    return response.summary
  }
  if (!response.hits.length) {
    return 'Recall stayed quiet on this page.'
  }
  return `Recall found ${response.hits.length} related item${response.hits.length === 1 ? '' : 's'}.`
}

