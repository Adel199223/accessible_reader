import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ReaderSurface } from './ReaderSurface'

import type { RenderableBlock } from '../lib/segment'
import type { ReaderSettings } from '../types'


const settings: ReaderSettings = {
  font_preset: 'system',
  text_size: 22,
  line_spacing: 1.7,
  line_width: 72,
  contrast_theme: 'soft',
  focus_mode: false,
  preferred_voice: 'default',
  speech_rate: 1,
}

afterEach(() => {
  cleanup()
})

test('ReaderSurface highlights the active sentence', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one. Sentence two.',
      sentences: [
        { key: 'one-0', text: 'Sentence one.', globalIndex: 0 },
        { key: 'one-1', text: 'Sentence two.', globalIndex: 1 },
      ],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={1}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  expect(screen.getByRole('button', { name: 'Sentence two.' })).toHaveClass('reader-sentence-active')
})

test('ReaderSurface allows sentence selection from the keyboard', () => {
  const onSelectSentence = vi.fn()
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one. Sentence two.',
      sentences: [
        { key: 'one-0', text: 'Sentence one.', globalIndex: 0 },
        { key: 'one-1', text: 'Sentence two.', globalIndex: 1 },
      ],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={0}
      settings={settings}
      onSelectSentence={onSelectSentence}
    />,
  )

  const secondSentence = screen.getByRole('button', { name: 'Sentence two.' })
  fireEvent.keyDown(secondSentence, { key: 'Enter' })
  fireEvent.keyDown(secondSentence, { key: ' ' })

  expect(onSelectSentence).toHaveBeenNthCalledWith(1, 1)
  expect(onSelectSentence).toHaveBeenNthCalledWith(2, 1)
})

test('ReaderSurface keeps an accessible article label without rendering a duplicate visible header', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one.',
      sentences: [{ key: 'one-0', text: 'Sentence one.', globalIndex: 0 }],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={0}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  expect(screen.getByRole('article', { name: 'Readable guide' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Readable guide' })).not.toBeInTheDocument()
})
