import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { curateVoices, pickBrowserVoice, useSpeech } from './useSpeech'

import type { RenderSentence } from '../lib/segment'

function makeSentence(index: number, text: string): RenderSentence {
  return {
    blockId: `block-${index}`,
    globalIndex: index,
    key: `block-${index}`,
    sentenceIndexInBlock: 0,
    text,
  }
}

function makeVoice(name: string, isDefault = false): SpeechSynthesisVoice {
  return {
    default: isDefault,
    lang: 'en-US',
    localService: true,
    name,
    voiceURI: name,
  } as SpeechSynthesisVoice
}

class MockSpeechSynthesisUtterance {
  onend: ((event: Event) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  rate = 1
  text = ''
  voice: SpeechSynthesisVoice | null = null

  constructor(text = '') {
    this.text = text
  }
}

const originalSpeechSynthesis = window.speechSynthesis
const originalUtterance = window.SpeechSynthesisUtterance

function installSpeechSynthesisMock() {
  const utterances: MockSpeechSynthesisUtterance[] = []
  const synthesis = {
    addEventListener: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => [makeVoice('Microsoft Ava Multilingual Natural')]),
    pause: vi.fn(),
    paused: false,
    pending: false,
    removeEventListener: vi.fn(),
    resume: vi.fn(),
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      utterances.push(utterance)
    }),
    speaking: false,
  }

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: synthesis as unknown as SpeechSynthesis,
  })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  })

  return {
    synthesis,
    utterances,
  }
}

afterEach(() => {
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: originalSpeechSynthesis,
  })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: originalUtterance,
  })
})

test('curateVoices orders preferred Edge voices before the default option', () => {
  const voices = [
    makeVoice('Contoso Default', true),
    makeVoice('Microsoft Andrew Multilingual Natural'),
    makeVoice('Microsoft Ava Multilingual Natural'),
  ]

  expect(curateVoices(voices)).toEqual([
    {
      id: 'ava',
      label: 'Ava Multilingual Natural',
      name: 'Microsoft Ava Multilingual Natural',
    },
    {
      id: 'andrew',
      label: 'Andrew Multilingual Natural',
      name: 'Microsoft Andrew Multilingual Natural',
    },
    {
      id: 'default',
      label: 'Default voice',
      name: 'default',
    },
  ])
})

test('pickBrowserVoice uses the documented fallback order for the default selection', () => {
  const browserDefault = makeVoice('Contoso Default', true)
  const andrew = makeVoice('Microsoft Andrew Multilingual Natural')
  const ava = makeVoice('Microsoft Ava Multilingual Natural')

  expect(pickBrowserVoice([browserDefault, andrew, ava], 'default')?.name).toBe(ava.name)
  expect(pickBrowserVoice([browserDefault, andrew], 'default')?.name).toBe(andrew.name)
  expect(pickBrowserVoice([browserDefault], 'default')?.name).toBe(browserDefault.name)
})

test('pickBrowserVoice falls back to the documented default order when the selected voice is missing', () => {
  const browserDefault = makeVoice('Contoso Default', true)
  const andrew = makeVoice('Microsoft Andrew Multilingual Natural')

  expect(pickBrowserVoice([browserDefault, andrew], 'Missing voice')?.name).toBe(andrew.name)
})

test('useSpeech does not cancel active playback when equivalent sentence content rerenders', () => {
  const { synthesis } = installSpeechSynthesisMock()
  const onSentenceChange = vi.fn()
  const sentences: RenderSentence[] = [
    makeSentence(0, 'First sentence.'),
    makeSentence(1, 'Second sentence.'),
  ]

  const { result, rerender } = renderHook(
    ({ items }) =>
      useSpeech({
        sentences: items,
        preferredVoice: 'default',
        rate: 1,
        initialSentenceIndex: 0,
        onSentenceChange,
      }),
    {
      initialProps: {
        items: sentences,
      },
    },
  )

  act(() => {
    result.current.start()
  })

  expect(result.current.isSpeaking).toBe(true)
  expect(synthesis.speak).toHaveBeenCalledTimes(1)
  const cancelCallsAfterStart = synthesis.cancel.mock.calls.length

  rerender({
    items: sentences.map((sentence) => ({ ...sentence })),
  })

  expect(result.current.isSpeaking).toBe(true)
  expect(synthesis.cancel).toHaveBeenCalledTimes(cancelCallsAfterStart)
})

test('useSpeech keeps playback active when parent syncs the current sentence back as progress', () => {
  const { synthesis } = installSpeechSynthesisMock()
  const onSentenceChange = vi.fn()
  const sentences: RenderSentence[] = [
    makeSentence(0, 'First sentence.'),
    makeSentence(1, 'Second sentence.'),
  ]

  const { result, rerender } = renderHook(
    ({ initialSentenceIndex }) =>
      useSpeech({
        sentences,
        preferredVoice: 'default',
        rate: 1,
        initialSentenceIndex,
        onSentenceChange,
      }),
    {
      initialProps: {
        initialSentenceIndex: 0,
      },
    },
  )

  act(() => {
    result.current.start()
  })
  act(() => {
    result.current.next()
  })

  expect(result.current.isSpeaking).toBe(true)
  expect(result.current.currentSentenceIndex).toBe(1)
  const cancelCallsAfterNext = synthesis.cancel.mock.calls.length

  rerender({
    initialSentenceIndex: 1,
  })

  expect(result.current.isSpeaking).toBe(true)
  expect(synthesis.cancel).toHaveBeenCalledTimes(cancelCallsAfterNext)
})

test('useSpeech jumpTo restarts playback from the chosen sentence while actively reading', () => {
  const { synthesis, utterances } = installSpeechSynthesisMock()
  const onSentenceChange = vi.fn()
  const sentences: RenderSentence[] = [
    makeSentence(0, 'First sentence.'),
    makeSentence(1, 'Second sentence.'),
  ]

  const { result } = renderHook(() =>
    useSpeech({
      sentences,
      preferredVoice: 'default',
      rate: 1,
      initialSentenceIndex: 0,
      onSentenceChange,
    }),
  )

  act(() => {
    result.current.start()
  })
  const cancelCallsAfterStart = synthesis.cancel.mock.calls.length
  act(() => {
    result.current.jumpTo(1)
  })

  expect(result.current.isSpeaking).toBe(true)
  expect(result.current.currentSentenceIndex).toBe(1)
  expect(synthesis.cancel).toHaveBeenCalledTimes(cancelCallsAfterStart + 1)
  expect(utterances.at(-1)?.text).toBe('Second sentence.')
})

test('useSpeech jumpTo resumes playback from the chosen sentence while paused', () => {
  const { synthesis, utterances } = installSpeechSynthesisMock()
  const onSentenceChange = vi.fn()
  const sentences: RenderSentence[] = [
    makeSentence(0, 'First sentence.'),
    makeSentence(1, 'Second sentence.'),
  ]

  const { result } = renderHook(() =>
    useSpeech({
      sentences,
      preferredVoice: 'default',
      rate: 1,
      initialSentenceIndex: 0,
      onSentenceChange,
    }),
  )

  act(() => {
    result.current.start()
  })
  act(() => {
    result.current.pause()
  })
  act(() => {
    result.current.jumpTo(1)
  })

  expect(synthesis.pause).toHaveBeenCalledTimes(1)
  expect(result.current.isPaused).toBe(false)
  expect(result.current.currentSentenceIndex).toBe(1)
  expect(utterances.at(-1)?.text).toBe('Second sentence.')
})

test('useSpeech jumpTo only selects while idle or after stop', () => {
  const { synthesis } = installSpeechSynthesisMock()
  const onSentenceChange = vi.fn()
  const sentences: RenderSentence[] = [
    makeSentence(0, 'First sentence.'),
    makeSentence(1, 'Second sentence.'),
  ]

  const { result } = renderHook(() =>
    useSpeech({
      sentences,
      preferredVoice: 'default',
      rate: 1,
      initialSentenceIndex: 0,
      onSentenceChange,
    }),
  )

  act(() => {
    result.current.jumpTo(1)
  })

  expect(result.current.currentSentenceIndex).toBe(1)
  expect(result.current.isSpeaking).toBe(false)
  expect(synthesis.speak).not.toHaveBeenCalled()

  act(() => {
    result.current.start()
  })
  act(() => {
    result.current.stop()
  })
  act(() => {
    result.current.jumpTo(0)
  })

  expect(result.current.isSpeaking).toBe(false)
  expect(result.current.currentSentenceIndex).toBe(0)
  expect(synthesis.speak).toHaveBeenCalledTimes(1)
})

test('useSpeech jumpTo only selects after playback ends naturally', () => {
  const { synthesis, utterances } = installSpeechSynthesisMock()
  const onSentenceChange = vi.fn()
  const sentences: RenderSentence[] = [
    makeSentence(0, 'First sentence.'),
    makeSentence(1, 'Second sentence.'),
  ]

  const { result } = renderHook(() =>
    useSpeech({
      sentences,
      preferredVoice: 'default',
      rate: 1,
      initialSentenceIndex: 0,
      onSentenceChange,
    }),
  )

  act(() => {
    result.current.start()
  })
  act(() => {
    utterances[0]?.onend?.(new Event('end'))
  })
  act(() => {
    utterances[1]?.onend?.(new Event('end'))
  })
  act(() => {
    result.current.jumpTo(1)
  })

  expect(result.current.isSpeaking).toBe(false)
  expect(result.current.currentSentenceIndex).toBe(1)
  expect(synthesis.speak).toHaveBeenCalledTimes(2)
})
