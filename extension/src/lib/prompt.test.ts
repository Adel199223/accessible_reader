import { describe, expect, it } from 'vitest'

import { buildPromptLabel, shouldShowPrompt } from './prompt'
import type { BrowserContextResponse } from './contracts'
import { DEFAULT_SETTINGS } from './settings'


const baseResponse: BrowserContextResponse = {
  hits: [
    {
      document_title: 'Guide',
      excerpt: 'Grounded excerpt',
      hit_type: 'chunk',
      id: 'chunk:1',
      reasons: ['keyword chunk match'],
      score: 0.72,
      source_document_id: 'doc-1',
      title: 'Guide',
    },
  ],
  page_fingerprint: 'fingerprint-1',
  query: 'grounded selection text',
  should_prompt: true,
  summary: 'Recall found 1 related item for the selected text.',
  suppression_reasons: [],
  trigger_mode: 'selection',
}


describe('prompt helpers', () => {
  it('shows prompts only when auto prompting is enabled and the fingerprint is not dismissed', () => {
    expect(shouldShowPrompt(baseResponse, DEFAULT_SETTINGS, [])).toBe(true)
    expect(shouldShowPrompt(baseResponse, DEFAULT_SETTINGS, ['fingerprint-1'])).toBe(false)
    expect(shouldShowPrompt(baseResponse, { ...DEFAULT_SETTINGS, autoPrompt: false }, [])).toBe(false)
  })

  it('builds a stable prompt label from the backend summary', () => {
    expect(buildPromptLabel(baseResponse)).toBe('Recall found 1 related item for the selected text.')
    expect(
      buildPromptLabel({
        ...baseResponse,
        hits: [],
        should_prompt: false,
        summary: 'Recall stayed quiet on this page.',
      }),
    ).toBe('Recall stayed quiet on this page.')
  })
})
