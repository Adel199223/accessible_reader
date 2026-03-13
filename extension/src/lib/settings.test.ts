import { describe, expect, it } from 'vitest'

import { clampResultLimit, mergeSettings, normalizeBackendBaseUrl } from './settings'


describe('settings helpers', () => {
  it('normalizes the backend base URL', () => {
    expect(normalizeBackendBaseUrl(' http://127.0.0.1:8000/ ')).toBe('http://127.0.0.1:8000')
  })

  it('clamps the configured result limit', () => {
    expect(clampResultLimit(0)).toBe(1)
    expect(clampResultLimit(11)).toBe(10)
  })

  it('merges partial settings with defaults', () => {
    expect(
      mergeSettings({
        autoPrompt: false,
        backendBaseUrl: 'http://localhost:8021/',
      }),
    ).toEqual({
      autoPrompt: false,
      backendBaseUrl: 'http://localhost:8021',
      resultLimit: 4,
    })
  })
})

